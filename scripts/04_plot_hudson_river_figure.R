#!/usr/bin/env Rscript

# Rebuild panel A: the Hudson River map.
#
# Required map input:
#   data/raw/spatial/hr_shoreline_splitbymilemarker/hr_shoreline_splitbymilemarker.shp
#
# Useful environment overrides:
#   HRBMP_SHORELINE_SHP       - full path to hr_shoreline_splitbymilemarker.shp
#   HRBMP_FIGURE_OUTPUT_DIR   - output folder; defaults to gui/assets
#   HRBMP_MAP_STYLE           - light/color/terrain/classic; defaults to light
#   HRBMP_UPDATE_GUI_MAP      - TRUE/FALSE; copy selected style to GUI asset; defaults TRUE
#   HRBMP_SHOW_NOAA_COASTLINE - TRUE/FALSE; defaults to FALSE to avoid downloads
#   HRBMP_SHOW_BATHY          - TRUE/FALSE; defaults to FALSE
#
# Example:
#   Rscript scripts/04_plot_hudson_river_figure.R

script_args <- commandArgs(trailingOnly = FALSE)
script_file_arg <- script_args[grepl("^--file=", script_args)]

if (length(script_file_arg) > 0) {
  script_path <- normalizePath(sub("^--file=", "", script_file_arg[[1]]),
                               winslash = "/", mustWork = TRUE)
  repo_root <- normalizePath(file.path(dirname(script_path), ".."),
                             winslash = "/", mustWork = TRUE)
} else {
  repo_root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (basename(repo_root) == "scripts") {
    repo_root <- normalizePath(file.path(repo_root, ".."),
                               winslash = "/", mustWork = TRUE)
  }
}

env_or_default <- function(name, default) {
  value <- Sys.getenv(name, unset = NA_character_)
  if (is.na(value) || !nzchar(value)) default else value
}

env_flag <- function(name, default = FALSE) {
  value <- Sys.getenv(name, unset = NA_character_)
  if (is.na(value) || !nzchar(value)) {
    return(default)
  }
  tolower(value) %in% c("1", "true", "t", "yes", "y")
}

require_packages <- function(packages) {
  missing_packages <- packages[
    !vapply(packages, requireNamespace, logical(1), quietly = TRUE)
  ]
  if (length(missing_packages) > 0) {
    stop(sprintf(
      "Missing packages: %s\nInstall with install.packages(c(%s))",
      paste(missing_packages, collapse = ", "),
      paste(sprintf('"%s"', missing_packages), collapse = ", ")
    ))
  }
}

required_packages <- c(
  "sf", "ggplot2", "dplyr", "tigris", "ggspatial", "cowplot",
  "rnaturalearth", "maps"
)
require_packages(required_packages)

suppressPackageStartupMessages({
  library(sf)
  library(ggplot2)
  library(dplyr)
  library(tigris)
  library(ggspatial)
  library(cowplot)
  library(rnaturalearth)
  library(grid)
})

options(tigris_use_cache = TRUE)

shoreline_file <- env_or_default(
  "HRBMP_SHORELINE_SHP",
  file.path(
    repo_root,
    "data", "raw", "spatial", "hr_shoreline_splitbymilemarker",
    "hr_shoreline_splitbymilemarker.shp"
  )
)

output_dir <- env_or_default(
  "HRBMP_FIGURE_OUTPUT_DIR",
  file.path(repo_root, "gui", "assets")
)

show_bathy <- env_flag("HRBMP_SHOW_BATHY", default = FALSE)
show_noaa_coastline <- env_flag("HRBMP_SHOW_NOAA_COASTLINE", default = FALSE)
map_style <- tolower(env_or_default("HRBMP_MAP_STYLE", "light"))
update_gui_map <- env_flag("HRBMP_UPDATE_GUI_MAP", default = TRUE)

if (!map_style %in% c("color", "terrain", "light", "classic")) {
  stop("HRBMP_MAP_STYLE must be 'color', 'terrain', 'light', or 'classic'.")
}

if (map_style == "light") {
  require_packages(c("rosm", "prettymapr"))
}

map_palette <- switch(
  map_style,
  color = list(
    water = "#9ed4ef",
    inset_water = "#bde4f6",
    new_york = "#cce8b5",
    other_states = "#f1d7a4",
    inset_land = "#dce9bd",
    state_border = "#8c947d",
    region_border = "#173f36",
    coast = "#4f756d",
    river = "#1375ad",
    river_fill = "#1375ad70",
    grid = "#bfd5cc",
    state_label = "#4d5f55",
    city = "#1f302b",
    red = "#d83a2e",
    panel_bg = "#9ed4ef",
    export_bg = "#f4fbf8"
  ),
  terrain = list(
    water = "#8fc7e6",
    inset_water = "#acd8ed",
    new_york = "#a9bf78",
    other_states = "#d7bf83",
    inset_land = "#cdbb82",
    state_border = "#7b715c",
    region_border = "#254d34",
    coast = "#697b66",
    river = "#0d6fa6",
    river_fill = "#0d6fa670",
    grid = "#c7ceb3",
    state_label = "#526043",
    city = "#263424",
    red = "#cc3b2e",
    panel_bg = "#8fc7e6",
    export_bg = "#f3efdf"
  ),
  light = list(
    water = NA,
    inset_water = "#e9f3f7",
    new_york = NA,
    other_states = NA,
    inset_land = "#f0f0ed",
    state_border = "#c8cdd1",
    region_border = "#315c68",
    coast = "#aab5bb",
    river = "#0c78b6",
    river_fill = "#0c78b64d",
    grid = "#d9e0e4",
    state_label = "#8b9296",
    city = "#2f3b42",
    red = "#bf3b34",
    panel_bg = "#f7f8f8",
    export_bg = "white"
  ),
  classic = list(
    water = "#cfe8f3",
    inset_water = "#cfe8f3",
    new_york = "white",
    other_states = "gray90",
    inset_land = "gray88",
    state_border = "black",
    region_border = "black",
    coast = "black",
    river = "black",
    river_fill = "#cfe8f380",
    grid = "gray85",
    state_label = "gray20",
    city = "black",
    red = "red",
    panel_bg = "white",
    export_bg = "white"
  )
)

if (!dir.exists(output_dir)) {
  dir.create(output_dir, recursive = TRUE)
}

if (!file.exists(shoreline_file)) {
  stop(sprintf(
    paste(
      "Hudson shoreline shapefile not found:\n  %s\n",
      "Copy the shapefile folder into data/raw/spatial/hr_shoreline_splitbymilemarker/",
      "or set HRBMP_SHORELINE_SHP to the full .shp path."
    ),
    shoreline_file
  ))
}

city_pop_threshold <- 350000

xpad_left <- 50000
xpad_right <- 60000
ypad_bottom <- 60000
ypad_top <- 35000
shave_south <- 25000
shave_north <- 0

bathy_lon1 <- -74.8
bathy_lon2 <- -70.3
bathy_lat1 <- 38.3
bathy_lat2 <- 43.0
bathy_res <- 0.1
bathy_edge_buffer <- 9000

hudson_lwd <- 0.25
tick_offset_x <- -20000
tick_len <- 18000
tick_gap <- 2500

safe_intersection <- function(x, y) {
  suppressWarnings(st_intersection(x, y))
}

build_noaa_layers <- function(target_crs, clip_poly) {
  layers <- list(coast_line_sf = NULL, water_poly_sf = NULL)
  need_noaa <- isTRUE(show_bathy) || isTRUE(show_noaa_coastline)
  if (!need_noaa) {
    return(layers)
  }

  require_packages(c("marmap", "terra"))

  tryCatch({
    HRNYB <- marmap::getNOAA.bathy(
      lon1 = bathy_lon1, lon2 = bathy_lon2,
      lat1 = bathy_lat1, lat2 = bathy_lat2,
      resolution = bathy_res
    )

    HRNYB_raster <- marmap::as.raster(HRNYB)
    HRNYB_spat <- terra::rast(HRNYB_raster)
    terra::crs(HRNYB_spat) <- "EPSG:4326"

    water <- HRNYB_spat
    water[water >= 0] <- NA
    water[water < 0] <- 1
    water_poly <- terra::as.polygons(water, dissolve = TRUE)

    layers$water_poly_sf <- st_as_sf(water_poly) |>
      st_make_valid() |>
      st_transform(target_crs) |>
      safe_intersection(clip_poly)

    if (isTRUE(show_noaa_coastline)) {
      land <- HRNYB_spat
      land[land < 0] <- NA
      land[land >= 0] <- 1
      coast_poly <- terra::as.polygons(land, dissolve = TRUE)

      coast_sf <- st_as_sf(coast_poly) |>
        st_make_valid() |>
        st_transform(target_crs) |>
        safe_intersection(clip_poly)

      bathy_domain_ll <- st_as_sfc(
        st_bbox(
          c(
            xmin = bathy_lon1, xmax = bathy_lon2,
            ymin = bathy_lat1, ymax = bathy_lat2
          ),
          crs = st_crs(4326)
        )
      )

      bathy_domain_border <- st_boundary(st_transform(bathy_domain_ll, target_crs)) |>
        st_buffer(dist = bathy_edge_buffer)

      layers$coast_line_sf <- coast_sf |>
        st_cast("MULTILINESTRING") |>
        st_make_valid() |>
        st_difference(st_union(bathy_domain_border)) |>
        st_make_valid() |>
        mutate(L = as.numeric(st_length(geometry))) |>
        filter(L >= quantile(L, probs = 0.02, na.rm = TRUE)) |>
        select(-L)
    }

    layers
  }, error = function(e) {
    warning(sprintf("NOAA coastline/bathymetry layers skipped: %s",
                    conditionMessage(e)))
    list(coast_line_sf = NULL, water_poly_sf = NULL)
  })
}

build_reference_tile_layer <- function() {
  if (map_style != "light") {
    return(NULL)
  }

  tile_cache_dir <- file.path(repo_root, "data", "processed", "tile-cache")
  if (!dir.exists(tile_cache_dir)) {
    dir.create(tile_cache_dir, recursive = TRUE, showWarnings = FALSE)
  }

  annotation_map_tile(
    type = "cartolight",
    zoomin = 0,
    cachedir = tile_cache_dir,
    progress = "none",
    quiet = TRUE,
    alpha = 0.42
  )
}

build_inset_map <- function(clip_bb) {
  tryCatch({
    states_us <- ne_states(country = "united states of america", returnclass = "sf") |>
      st_transform(26918)

    canada_us <- ne_states(country = "canada", returnclass = "sf") |>
      st_transform(26918)

    rivers_data <- ne_download(
      scale = 10,
      type = "rivers_lake_centerlines",
      category = "physical",
      returnclass = "sf"
    )

    hudson_river <- subset(rivers_data, name == "Hudson") |>
      st_transform(26918)

    study_box_sf <- st_as_sfc(clip_bb)

    inset_limits <- st_sfc(
      st_point(c(-81, 37.5)),
      st_point(c(-69, 47)),
      crs = 4326
    ) |>
      st_transform(26918) |>
      st_coordinates()

    inset_land_fill <- if (map_style == "light") "#e5eadf" else map_palette$inset_land
    inset_water_fill <- if (map_style == "light") "#dceff7" else map_palette$inset_water
    inset_ny_fill <- if (map_style == "light") "#cfe6c8" else map_palette$new_york
    inset_border_color <- if (map_style == "light") "#8f9da2" else map_palette$state_border
    inset_label_color <- if (map_style == "light") "#66747a" else map_palette$state_label

    ggplot() +
      geom_sf(data = canada_us, fill = inset_land_fill, color = "white", linewidth = 0.20) +
      geom_sf(data = states_us, fill = inset_land_fill, color = "white", linewidth = 0.20) +
      geom_sf(
        data = subset(states_us, name == "New York"),
        fill = inset_ny_fill,
        color = inset_border_color,
        linewidth = 0.55
      ) +
      geom_sf(data = hudson_river, color = map_palette$river, linewidth = 1.45) +
      geom_sf(data = study_box_sf, fill = NA, color = map_palette$red, linewidth = 1.25) +
      annotate(
        "text",
        x = 350000, y = 5000000,
        label = "CANADA",
        size = 4.2,
        fontface = "bold",
        color = inset_label_color
      ) +
      annotate(
        "text",
        x = 340000, y = 4500000,
        label = "USA",
        size = 4.2,
        fontface = "bold",
        color = inset_label_color
      ) +
      annotate(
        "text",
        x = 480000, y = 4800000,
        label = "NY",
        size = 3.7,
        fontface = "bold",
        color = inset_label_color
      ) +
      annotate(
        "text",
        x = 760000, y = 4350000,
        label = "ATLANTIC\nOCEAN",
        size = 3.7,
        color = inset_label_color
      ) +
      coord_sf(
        xlim = inset_limits[c(1, 2), 1],
        ylim = inset_limits[c(1, 2), 2],
        expand = FALSE
      ) +
      theme_void() +
      theme(
        panel.background = element_rect(fill = inset_water_fill, color = NA),
        panel.border = element_rect(color = inset_border_color, fill = NA, linewidth = 0.95),
        plot.tag = element_text(face = "bold", size = 16),
        plot.tag.position = c(0, 1.3)
      ) +
      labs(tag = "A)")
  }, error = function(e) {
    warning(sprintf("Inset map skipped: %s", conditionMessage(e)))
    NULL
  })
}

build_hudson_map <- function() {
  hudson_shoreline <- st_read(shoreline_file, quiet = TRUE) |>
    st_make_valid() |>
    filter(!st_is_empty(geometry))

  if (nrow(hudson_shoreline) == 0) {
    stop("Shoreline has 0 valid features. Check shapefile.")
  }

  target_crs <- st_crs(hudson_shoreline)
  bb <- st_bbox(hudson_shoreline)
  if (any(is.na(bb))) {
    stop("st_bbox(hudson_shoreline) has NA.")
  }

  xmin0 <- as.numeric(bb["xmin"])
  xmax0 <- as.numeric(bb["xmax"])
  ymin0 <- as.numeric(bb["ymin"])
  ymax0 <- as.numeric(bb["ymax"])

  xlim_use <- c(xmin0 - xpad_left, xmax0 + xpad_right)
  ylim_use <- c(ymin0 - ypad_bottom, ymax0 + ypad_top)
  ylim_use[1] <- ylim_use[1] + shave_south
  ylim_use[2] <- ylim_use[2] - shave_north

  clip_bb <- st_bbox(
    c(
      xmin = xlim_use[1], xmax = xlim_use[2],
      ymin = ylim_use[1], ymax = ylim_use[2]
    ),
    crs = target_crs
  )
  clip_poly <- st_as_sfc(clip_bb)

  states_data <- tigris::states(cb = TRUE, resolution = "5m") |>
    filter(STUSPS %in% c("NY", "NJ", "CT", "PA", "MA", "RI", "VT", "NH")) |>
    st_transform(target_crs) |>
    st_make_valid() |>
    safe_intersection(clip_poly) |>
    mutate(fill_group = ifelse(STUSPS == "NY", "New York", "Other states"))

  state_labels_manual <- data.frame(
    name = c("NY", "NJ", "CT", "MA"),
    lon = c(-73.63, -74.44, -73.19, -73.15),
    lat = c(42.63, 40.76, 41.82, 42.70)
  )

  state_labels_sf <- st_as_sf(
    state_labels_manual,
    coords = c("lon", "lat"),
    crs = 4326
  ) |>
    st_transform(target_crs) |>
    safe_intersection(clip_poly)

  major_cities <- maps::us.cities |>
    filter(country.etc %in% c("NY", "NJ", "PA", "CT", "MA", "RI")) |>
    filter(pop > city_pop_threshold | name %in% c("Hartford CT", "New York NY")) |>
    filter(!name %in% c("Albany NY", "Philadelphia PA")) |>
    st_as_sf(coords = c("long", "lat"), crs = 4326) |>
    st_transform(target_crs) |>
    mutate(name = gsub(" [A-Z]{2}$", "", name)) |>
    safe_intersection(clip_poly) |>
    mutate(
      nudge_x = case_when(name == "New York" ~ 2000, TRUE ~ 0),
      nudge_y = case_when(
        name == "New York" ~ 4000,
        TRUE ~ 9000
      )
    )

  region_names <- c(
    "BT (0)", "YK (1)", "TZ (2)", "CH (3)", "IP (4)", "WP (5)",
    "CW (6)", "PK (7)", "HP (8)", "KG (9)", "SG (10)", "CS (11)", "AL (12)"
  )

  hudson_regions_raw <- hudson_shoreline |>
    mutate(
      center = st_point_on_surface(geometry),
      center_x = st_coordinates(center)[, 1],
      center_y = st_coordinates(center)[, 2]
    ) |>
    arrange(center_y) |>
    mutate(
      RegionID = row_number() - 1,
      Landmark = region_names[RegionID + 1]
    )

  hudson_regions <- hudson_regions_raw |>
    st_make_valid() |>
    safe_intersection(clip_poly)

  region_bounds <- hudson_regions_raw |>
    rowwise() |>
    mutate(
      ymin = as.numeric(st_bbox(geometry)["ymin"]),
      ymax = as.numeric(st_bbox(geometry)["ymax"])
    ) |>
    ungroup() |>
    st_drop_geometry() |>
    transmute(Landmark, ymin, ymax)

  bound_y <- sort(unique(c(region_bounds$ymin, region_bounds$ymax)))
  bound_y <- bound_y[bound_y >= ylim_use[1] & bound_y <= ylim_use[2]]

  if (length(bound_y) > 14) {
    idx <- round(seq(1, length(bound_y), length.out = 14))
    bound_y <- bound_y[idx]
  }

  if (length(bound_y) < 2) {
    stop("Could not derive enough Hudson region boundaries from the shoreline file.")
  }

  tick_lines <- data.frame(y = bound_y)
  label_centers <- data.frame(
    Landmark = region_names[seq_len(length(bound_y) - 1)],
    y = (bound_y[-1] + bound_y[-length(bound_y)]) / 2
  )

  hud_centers <- hudson_regions_raw |>
    st_drop_geometry() |>
    transmute(center_x, center_y)

  nearest_x <- function(yval) {
    hud_centers$center_x[which.min(abs(hud_centers$center_y - yval))]
  }

  tick_lines$center_x <- vapply(tick_lines$y, nearest_x, numeric(1))
  label_centers$center_x <- vapply(label_centers$y, nearest_x, numeric(1))

  tick_df <- tick_lines |>
    mutate(
      tick_x = center_x + tick_offset_x,
      tick_xend = tick_x + tick_len
    )

  label_df <- label_centers |>
    mutate(
      text_x = ifelse(
        Landmark == "AL (12)",
        xlim_use[1] + 0.36 * diff(xlim_use),
        (center_x + tick_offset_x) - tick_gap
      ),
      text_y = y,
      label_hjust = ifelse(Landmark == "AL (12)", 0, 1)
    )

  noaa_layers <- build_noaa_layers(target_crs = target_crs, clip_poly = clip_poly)
  reference_tile_layer <- build_reference_tile_layer()

  water_layer <- if (!is.null(noaa_layers$water_poly_sf) && map_style != "light") {
    geom_sf(data = noaa_layers$water_poly_sf, fill = map_palette$water, color = NA)
  } else {
    NULL
  }

  state_layers <- if (map_style == "light") {
    list(
      geom_sf(
        data = states_data,
        fill = NA,
        color = map_palette$state_border,
        linewidth = 0.35
      )
    )
  } else {
    list(
      geom_sf(
        data = states_data,
        aes(fill = fill_group),
        color = map_palette$state_border,
        linewidth = 0.45
      ),
      scale_fill_manual(
        values = c(
          "New York" = map_palette$new_york,
          "Other states" = map_palette$other_states
        ),
        guide = "none"
      )
    )
  }

  state_label_layer <- if (map_style == "light") {
    NULL
  } else {
    geom_sf_text(
      data = state_labels_sf,
      aes(label = name),
      size = 7.2,
      fontface = "bold",
      alpha = 0.48,
      color = map_palette$state_label
    )
  }

  city_layers <- if (map_style == "light") {
    NULL
  } else {
    list(
      geom_sf(data = major_cities, size = 1.8, color = map_palette$city),
      geom_sf_text(
        data = major_cities,
        aes(label = name),
        nudge_x = major_cities$nudge_x,
        nudge_y = major_cities$nudge_y,
        size = 4.6,
        fontface = "bold",
        color = map_palette$city
      )
    )
  }

  LIS_x <- xlim_use[1] + 0.80 * diff(xlim_use)
  LIS_y <- ylim_use[1] + 0.22 * diff(ylim_use)

  NYB_x <- xlim_use[1] + 0.60 * diff(xlim_use)
  NYB_y <- ylim_use[1] + 0.05 * diff(ylim_use)

  p_final <- ggplot() +
    reference_tile_layer +
    water_layer +
    state_layers +
    { if (isTRUE(show_noaa_coastline) && !is.null(noaa_layers$coast_line_sf)) geom_sf(data = noaa_layers$coast_line_sf, color = map_palette$coast, linewidth = 0.30) } +
    geom_sf(
      data = hudson_regions,
      fill = map_palette$river_fill,
      color = map_palette$river,
      linewidth = 0.42
    ) +
    state_label_layer +
    geom_segment(
      data = tick_df,
      aes(x = tick_x, xend = tick_xend, y = y, yend = y),
      color = map_palette$region_border,
      linewidth = 0.26,
      alpha = 0.72
    ) +
    geom_text(
      data = label_df,
      aes(x = text_x, y = text_y, label = Landmark, hjust = label_hjust),
      vjust = 0.5,
      size = 4.4,
      fontface = "bold",
      color = map_palette$region_border
    ) +
    city_layers +
    annotate(
      "text",
      x = LIS_x, y = LIS_y,
      label = "Long Island Sound",
      size = 5,
      fontface = "bold.italic",
      color = map_palette$city
    ) +
    annotate(
      "text",
      x = NYB_x, y = NYB_y,
      label = "New York Bight",
      size = 5,
      fontface = "bold.italic",
      color = map_palette$city
    ) +
    coord_sf(
      crs = target_crs,
      default_crs = target_crs,
      xlim = xlim_use,
      ylim = ylim_use,
      expand = FALSE,
      label_graticule = "SW"
    ) +
    annotation_scale(
      location = "bl",
      width_hint = 0.20,
      style = "ticks",
      pad_x = unit(0.20, "in"),
      pad_y = unit(0.20, "in")
    ) +
    annotation_north_arrow(
      location = "bl",
      which_north = "true",
      pad_x = unit(0.30, "in"),
      pad_y = unit(0.60, "in"),
      style = north_arrow_fancy_orienteering(text_size = 10)
    ) +
    theme_minimal() +
    theme(
      panel.grid = element_line(color = map_palette$grid, linewidth = 0.3),
      axis.text = element_text(size = 10.5, color = map_palette$city),
      axis.title = element_blank(),
      axis.ticks = element_line(color = map_palette$city),
      panel.background = element_rect(fill = map_palette$panel_bg, color = NA),
      legend.position = "none"
    )

  p_inset <- build_inset_map(clip_bb = clip_bb)
  p_inset_clean <- if (is.null(p_inset)) {
    NULL
  } else {
    p_inset + theme(plot.tag = element_blank())
  }

  p_out_clean <- if (is.null(p_inset_clean)) {
    p_final
  } else {
    ggdraw() +
      draw_plot(p_final, x = 0, y = 0, width = 1, height = 1) +
      draw_plot(p_inset_clean, x = 0.03, y = 0.71, width = 0.31, height = 0.25)
  }

  p_out_clean
}

message("Building Hudson River map...")
map_plot <- build_hudson_map()

style_png_path <- file.path(output_dir, sprintf("fig1a_hudson_map_%s.png", map_style))
style_pdf_path <- file.path(output_dir, sprintf("Fig1A_Hudson_Map_%s.pdf", map_style))
gui_png_path <- file.path(output_dir, "fig1a_hudson_map.png")
gui_pdf_path <- file.path(output_dir, "Fig1A_Hudson_Map.pdf")

ggsave(
  filename = style_png_path,
  plot = map_plot,
  width = 8,
  height = 15,
  units = "in",
  dpi = 900,
  bg = map_palette$export_bg,
  limitsize = FALSE
)

ggsave(
  filename = style_pdf_path,
  plot = map_plot,
  width = 8,
  height = 15,
  units = "in",
  bg = map_palette$export_bg
)

if (isTRUE(update_gui_map)) {
  file.copy(style_png_path, gui_png_path, overwrite = TRUE)
  file.copy(style_pdf_path, gui_pdf_path, overwrite = TRUE)
}

message(sprintf("Wrote %s map outputs to %s", map_style, output_dir))
if (isTRUE(update_gui_map)) {
  message("Updated GUI map asset: fig1a_hudson_map.png")
}
