#!/bin/bash

# Run just the notes migration
node -e "require('./src/migrations/run_migrations').runSingleFile('./src/migrations/update_notes_for_ai_generation.sql')"

echo "Notes migration completed!" 