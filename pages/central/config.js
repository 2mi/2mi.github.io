var config = exports.config = {};

var service = exports.service =
  {
    uuid: "1ad1bf10-efb7-595a-8aec-f7c41c694aba",
    characteristics: 
    {
      authentication:
      {
        secure_key: {
          uuid: "1ad1bf13-efb7-595a-8aec-f7c41c694aba",
          size: 32
        },
        challenge: {
          uuid: "1ad1bf14-efb7-595a-8aec-f7c41c694aba",
          size: 32
        },
        signature: {
          uuid: "1ad1bf12-efb7-595a-8aec-f7c41c694aba",
          size: 64
        },
        nonce: {
          uuid: "1ad1bf11-efb7-595a-8aec-f7c41c694aba",
          size: 20
        }
      },
      operation:
      {
        state: {
          uuid: "1ad1bf15-efb7-595a-8aec-f7c41c694aba",
          size: 1
        },
        type: {
          uuid: "1ad1bf16-efb7-595a-8aec-f7c41c694aba",
          size: 1
        },
        parameter: {
          uuid: "1ad1bf17-efb7-595a-8aec-f7c41c694aba",
          size: 248
        }
      }
    }
  };