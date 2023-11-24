# README.md

## Description

This repository contains a TypeScript application designed for managing redirection links and associating them with a custom domain. Leveraging the Serverless Stack (SST), the application creates an efficient, scalable serverless infrastructure on AWS. It features two DynamoDB tables: one for storing event details and another for managing URL redirection data. The application uses an API Gateway to expose endpoints that enable CRUD operations for redirection links. Additionally, Lambda functions are utilized for both business logic and authentication purposes. This setup allows users to easily manage and track redirection links, making it an ideal solution for custom URL shortening or redirection services with personalized domain support.

For more detailed information about SST, visit [sst.dev](https://sst.dev).

## Architecture

- **DynamoDB Tables**:
  - `Events`: Stores event-related data.
    - Partition Key: `eventHash`
    - Sort Key: `eventId`
  - `LinkRedirector`: Manages URL redirection data.
    - Partition Key: `ownerId`
    - Sort Key: `originalUrl`
- **API Gateway**:
  - Custom domain configuration.
  - Endpoints for managing redirection links and performing redirections.
- **Lambda Functions**:
  - Basic authorization.
  - CRUD operations for tables and redirection logic.

## Setup

### Prerequisites

- Node.js and npm.
- Configured AWS CLI.
- SST (`npm install -g sst`).

### AWS CLI Configuration

1. Install the AWS CLI following the instructions on the [AWS CLI website](https://aws.amazon.com/cli/).
2. Run `aws configure` to set up your credentials.
    ```bash
    aws configure
    ```
3. Enter your AWS Access Key ID, Secret Access Key, region, and output format when prompted.

### Installation

1. Clone the repo.
2. Inside the project folder, run `npm install`.

### Environment Variables

Set up:
- `HOSTED_ZONE`: For the custom domain in AWS Route53.
- `USERNAME`, `PASSWORD`: For basic authorization.
- `OWNER_ID`, `API_KEY`: For Lambda functions.
- `NOT_FOUND_LINK`, `BLANK_LINK`: For specific redirection scenarios.

### Deployment

Deploy with `sst deploy`.

## Usage

Post-deployment, access the API via the custom domain. The endpoints allow managing redirection links and executing redirections using codes.

## Outputs

Includes DynamoDB tables' names and ARNs, and the API's custom domain URL.

## Contributing

Contributions are welcome. Please submit pull requests or open issues for discussion.

## License

[MIT License](https://opensource.org/licenses/MIT). Permits free use, modification, distribution, and private use.

## Contact

Please contact me by email or website using:

Email: giovanni@diaumempreendedor.com.br
Website: https://dia1tech.com.br