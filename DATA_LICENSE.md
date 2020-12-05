# Data licence

The state and city data in `src/data/` (and the built files in `dist/` that contain it) is derived from the
[countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database) by Darshan Gada
and contributors, made available under the
[Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/).

Changes made for this package: filtered to India; districts, area rows and abandoned places removed; duplicates
removed; one city added (Kalaburagi, Karnataka); two Hindi state names corrected; state codes mapped to current
ISO 3166-2:IN codes. These changes are also released under ODbL v1.0.

If you redistribute this data, or a database derived from it, you must keep this attribution and share the data
under the same licence. Using the package inside an application (displaying states and cities in a form, for
example) does not by itself require you to release your application's code.

The package's source code (everything outside `src/data/`) is licensed under the MIT licence; see `LICENSE`.
