#!/bin/bash

# filepath: /Users/deividfoggi/Library/CloudStorage/OneDrive-Microsoft/Documents/GitHub/catfeeder2.0/scripts/sync_crontab.sh

# Path to the schedules file
SCHEDULES_FILE="/Users/deividfoggi/Library/CloudStorage/OneDrive-Microsoft/Documents/GitHub/catfeeder2.0/data/schedules.txt"

# Temporary file to store the new crontab
TEMP_CRONTAB=$(mktemp)

# Read the current crontab into the temporary file
crontab -l > "$TEMP_CRONTAB"

# Read the schedules file line by line
while IFS= read -r line
do
  # Extract the id, crontab schedule, and portions
  id=$(echo "$line" | awk '{print $1}' | cut -d'=' -f2)
  cron_schedule=$(echo "$line" | awk '{print $2, $3, $4, $5, $6}')
  portions=$(echo "$line" | awk '{print $8}' | cut -d'=' -f2)

  # Create the cron job command with a label
  cron_command="echo 'Feeding the cat with $portions portions' # id=$id"

  # Check if the cron job already exists
  if ! grep -q "# id=$id" "$TEMP_CRONTAB"; then
    # Add the cron job to the temporary crontab
    echo "$cron_schedule $cron_command" >> "$TEMP_CRONTAB"
  fi
done < "$SCHEDULES_FILE"

# Remove any cron jobs that are not in the schedules file
grep -v "# id=" "$TEMP_CRONTAB" > "$TEMP_CRONTAB.tmp"
mv "$TEMP_CRONTAB.tmp" "$TEMP_CRONTAB"

# Add the new crontab
crontab "$TEMP_CRONTAB"

# Clean up
rm "$TEMP_CRONTAB"

echo "Crontab synchronized successfully."