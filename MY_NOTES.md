Outward Sign Code Audit (same thing as repeating agent code problems)
These are the things that the agents often get wrong or need to be reminded of

are we following all the documentation
does the calendar work?
is the homepage updated
dashboard updated?
user documentation updated?
agent documentation updated?
legacy code should be removed
old tasks in the /tasks folder
old requirements in the /requirements folder should be removed
old brainsstorming in the /brainstorming folder should be removed
do you need to create a sheet for the /human-summary documentation
are there any security concerns 
is the user input data being sanitized.
carefully checking tags that are being rendered especially in rich-text areas
look for dead code and remove
look for backwards compatible code - remove it.
look for todos left in code - address them
check the linting and remove the errors
run the regular tests (e2e)
run the unit tests
make sure that tables have sort order on the headings
make sure that tables are doing server-side work - data wise
look for bare (select, input, textarea) and use FormInput
make sure that the search card does not have the same options that table sorting are offering
make sure we are using translations wherever the system defines text.  If the user defines the text, then don't translate the text.
dont use bare Dialog components.  use custom components
make sure that views are mobile friendly
make sure that the user can't navigate away from a view without saving

