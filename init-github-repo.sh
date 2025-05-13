#!/bin/bash

# EchoMind GitHub Repository Initialization Script

echo "======================================"
echo "EchoMind GitHub Repository Initialization"
echo "======================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git and try again."
    exit 1
fi

# Initialize a new git repository
echo "Initializing a new git repository..."
git init

# Add all files to the repository
echo "Adding files to the repository..."
git add .

# Commit the changes
echo "Committing changes..."
git commit -m "Initial commit of deployment-ready EchoMind codebase for Netlify"

# Prompt for GitHub repository details
read -p "Enter your GitHub username: " github_username
read -p "Enter the name for your new GitHub repository: " repo_name

# Create a new GitHub repository
echo "Creating a new GitHub repository..."
echo "Please create a new repository on GitHub with the name: $repo_name"
echo "Then run the following commands:"
echo ""
echo "git remote add origin https://github.com/$github_username/$repo_name.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Or use the GitHub CLI if you have it installed:"
echo "gh repo create $repo_name --public --source=. --remote=origin --push"

echo "======================================"
echo "Repository initialization complete!"
echo "======================================"
