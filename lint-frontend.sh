#!/bin/bash
# Wrapper script to run ESLint from frontend directory
# This ensures proper module resolution for next/babel and other dependencies

cd frontend || exit 1

# Strip "frontend/" prefix from file paths
files=()
for file in "$@"; do
    files+=("${file#frontend/}")
done

# Run ESLint from frontend context
npx eslint --fix "${files[@]}"
