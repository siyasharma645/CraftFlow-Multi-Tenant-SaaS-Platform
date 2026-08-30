#!/bin/bash
echo "Building CraftFlow Backend..."
mvn clean package -DskipTests
echo "Starting CraftFlow Backend..."
java -jar target/craftflow-backend-1.0.0.jar
