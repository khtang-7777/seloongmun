export type Seloongmun = {
  "version": "0.1.0",
  "name": "seloongmun",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "safeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seloongmun",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "draw",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "safeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seloongmun",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "seloongmun",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastCard",
            "type": "u8"
          },
          {
            "name": "leftPole",
            "type": "u8"
          },
          {
            "name": "rightPole",
            "type": "u8"
          },
          {
            "name": "deck",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "safeVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reserveRate",
            "type": "u8"
          },
          {
            "name": "poolAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotEnoughBet",
      "msg": "Your wallet should have at least double than your bet"
    },
    {
      "code": 6001,
      "name": "NotEnoughFund",
      "msg": "You betting more than our pool"
    }
  ]
};

export const IDL: Seloongmun = {
  "version": "0.1.0",
  "name": "seloongmun",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "safeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seloongmun",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "draw",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "safeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seloongmun",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "seloongmun",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastCard",
            "type": "u8"
          },
          {
            "name": "leftPole",
            "type": "u8"
          },
          {
            "name": "rightPole",
            "type": "u8"
          },
          {
            "name": "deck",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "safeVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reserveRate",
            "type": "u8"
          },
          {
            "name": "poolAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotEnoughBet",
      "msg": "Your wallet should have at least double than your bet"
    },
    {
      "code": 6001,
      "name": "NotEnoughFund",
      "msg": "You betting more than our pool"
    }
  ]
};
