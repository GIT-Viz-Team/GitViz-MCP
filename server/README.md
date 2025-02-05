# GitGPT Server

## Introduction

This is the server for GitGPT extension. It is a Flask server that serves the GitGPT model and provides an API for the extension to interact with the model.

## Setup

1. Clone the repository
2. Install [pipx package manager](https://pixi.sh/latest/#installation)
3. Create a .env file in the server directory with the following content:
   ```bash
   GROQ_API_KEY=<GROQ_API_KEY>
   ```
4. Start the server
   ```bash
   pipx run serve
   ```