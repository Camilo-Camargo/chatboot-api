# Chatbot API

## Description
This project is a NestJS-based Chatbot API that allows users to interact with a chatbot to get information about products. 

## Project setup
To get started with the project, follow these steps:
1. Copy the `.env.example` file to create a `.env` file, then update the necessary configurations in the .env file.
2. Install dependencies
```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## API Documentation
## Chatbot Interaction Endpoint
* Endpoint: POST /chatbot
* Description: Sends a request to the chatbot and receives a response.

### Request Body
The request body must be a JSON object that adheres to the ChatbotReq schema. Below are examples of the request payload:

json
```bash
{
  "input": "I am looking for a phone"
}
```

### Example Request
1. Request for a phone:
```bash
curl -X POST http://localhost:3000/chatbot \
-H "Content-Type: application/json" \
-d '{"input": "I am looking for a phone"}'
```

2. Request for a present for dad:
```bash
curl -X POST http://localhost:3000/chatbot \
-H "Content-Type: application/json" \
-d '{"input": "I am looking for a present for my dad"}'
```

3. Inquiry about watch price:

```bash
curl -X POST http://localhost:3000/chatbot \
-H "Content-Type: application/json" \
-d '{"input": "How much does a watch costs?"}'
```

4. Price inquiry for watch in Euros:

```bash
curl -X POST http://localhost:3000/chatbot \
-H "Content-Type: application/json" \
-d '{"input": "What is the price of the watch in Euros?"}'
```

5. Currency conversion inquiry:
```bash
curl -X POST http://localhost:3000/chatbot \
-H "Content-Type: application/json" \
-d '{"input": "How many Canadian Dollars are 350 Euros?"}'
```
