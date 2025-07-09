#!/bin/bash

USER_ID="9f97c5d4-19d9-4fa8-a274-69bc35b2c7f2"  # replace with your real UUID

for i in {1..10}
do
  curl -s -X POST http://localhost:3000/api/blacklist \
  -H "Content-Type: application/json" \
  -H "User-Id: $USER_ID" \
  -d "{\"link\": \"http://example$i.com\"}" &
done

wait
echo "All curl requests completed."
