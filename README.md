# Dream Visualizer

## Overview
Dream Visualizer is a web application that generates surrealist stories and corresponding images using the OpenAI API. Users can input keywords to create dream-like narratives, which are then transformed into vivid image prompts for DALL·E.

## Project Structure
```
dream-visualizer-0615
├── public
│   ├── index.html       # Main HTML document for the application
│   ├── styles.css       # Styles for the application
│   └── script.js        # JavaScript for interactivity and API calls
├── src
│   ├── server.js        # Main server file for handling requests
│   └── utils
│       └── helpers.js   # Utility functions for various tasks
├── images               # Directory for storing generated images
├── .env                 # Environment variables (API keys, etc.)
├── .gitignore           # Files and directories to ignore by Git
├── package.json         # npm configuration file
├── README.md            # Project documentation
└── LICENSE              # Licensing information
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dream-visualizer-0615.git
   ```
2. Navigate to the project directory:
   ```
   cd dream-visualizer-0615
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Usage
1. Start the server:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000` to access the application.

## Features
- Generate dream-like stories based on user-defined keywords.
- Create vivid image prompts for DALL·E based on the generated stories.
- Download and view generated images.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
