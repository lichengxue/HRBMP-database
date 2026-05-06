# GitHub, SQLite, And The API

GitHub is best used for version control and collaboration. It should store the
database design, scripts, documentation, GUI code, and small public example
files. It should not be treated as the live database server for restricted or
large HRBMP records.

## What Can Live In GitHub

- SQL schema files such as `database/schema.sql`
- R scripts for creating, loading, checking, and exporting data
- GUI files in `gui/`
- API source code in `api/`
- Documentation in `docs/`
- Small fake or public example datasets

## What Should Not Live In GitHub

- Restricted HRBMP records
- Large SQLite database files
- Passwords, tokens, or API keys
- Private user-access tables

The repository ignores local SQLite files with `database/*.sqlite` so real or
working database copies are not accidentally committed.

## Recommended Development Setup

For local development, keep using SQLite:

1. Update `database/schema.sql` when the database structure changes.
2. Load reviewed data into `database/hrbmp.sqlite` locally.
3. Run the R or Python API server.
4. Open the GUI at `http://127.0.0.1:8010/gui/`.

## Public Or Restricted Deployment

For public or restricted access, the GUI should call a hosted API. The hosted
API can still use SQLite at first, but it must run on a server, not directly
inside GitHub Pages.

Good future hosting options include a university server, Posit Connect, Shiny
Server, or a small cloud application server. Before restricted data are exposed,
add login, roles, access logging, and reviewed data-release rules.
