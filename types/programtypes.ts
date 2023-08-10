export type AtozRaffle = {
  version: "0.1.0";
  name: "atoz_raffle";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "raffleAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "prizeTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "prizeMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "signerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "editionAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mplTokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "totalSupply";
          type: "u64";
        },
        {
          name: "ticketPrice";
          type: "u64";
        },
        {
          name: "startTime";
          type: "i64";
        },
        {
          name: "endTime";
          type: "i64";
        },
        {
          name: "name";
          type: "string";
        },
        {
          name: "prize";
          type: "publicKey";
        },
        {
          name: "useTimer";
          type: "bool";
        },
        {
          name: "useSplPay";
          type: "bool";
        }
      ];
    },
    {
      name: "buyTicket";
      accounts: [
        {
          name: "raffleAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ticket";
          isMut: true;
          isSigner: true;
        },
        {
          name: "treasuryAccount";
          isMut: true;
          isSigner: false;
          docs: ["CHECK"];
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "lamports";
          type: "u64";
        }
      ];
    },
    {
      name: "changeVisibility";
      accounts: [
        {
          name: "raffleAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "visible";
          type: "bool";
        }
      ];
    },
    {
      name: "buyTicketSpl";
      accounts: [
        {
          name: "raffleAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ticket";
          isMut: true;
          isSigner: true;
        },
        {
          name: "prizeTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "pickWinner";
      accounts: [
        {
          name: "raffleAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "prizeMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeRaffle";
      accounts: [
        {
          name: "account";
          isMut: true;
          isSigner: false;
        },
        {
          name: "destination";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claimPrize";
      accounts: [
        {
          name: "raffleAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "winner";
          isMut: true;
          isSigner: false;
        },
        {
          name: "prizeMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "winnerAdr";
          isMut: true;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: true;
          isSigner: false;
        },
        {
          name: "prizeTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "raffle";
      type: {
        kind: "struct";
        fields: [
          {
            name: "useSplPay";
            type: "bool";
          },
          {
            name: "winner";
            type: "publicKey";
          },
          {
            name: "totalSuppy";
            type: "u64";
          },
          {
            name: "ticketsBought";
            type: "u64";
          },
          {
            name: "ticketPrice";
            type: "u64";
          },
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "participantsList";
            type: {
              vec: {
                defined: "Participants";
              };
            };
          },
          {
            name: "treasury";
            type: "publicKey";
          },
          {
            name: "claimed";
            type: "bool";
          },
          {
            name: "name";
            type: "string";
          },
          {
            name: "ticketList";
            type: {
              vec: {
                defined: "TicketBought";
              };
            };
          },
          {
            name: "prize";
            type: "publicKey";
          },
          {
            name: "open";
            type: "bool";
          },
          {
            name: "useTimer";
            type: "bool";
          },
          {
            name: "visible";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "ticket";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "ticketId";
            type: "u64";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "Participants";
      type: {
        kind: "struct";
        fields: [
          {
            name: "participant";
            type: "publicKey";
          },
          {
            name: "ticketsBought";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "TicketBought";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "ticketId";
            type: "u64";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "WinnerAlreadyExists";
      msg: "Winner already exists.";
    },
    {
      code: 6001;
      name: "NoTickets";
      msg: "Can't choose a winner when there are no tickets.";
    },
    {
      code: 6002;
      name: "WinnerNotChosen";
      msg: "Winner has not been chosen.";
    },
    {
      code: 6003;
      name: "InvalidWinner";
      msg: "Invalid winner.";
    },
    {
      code: 6004;
      name: "AlreadyClaimed";
      msg: "The prize has already been claimed.";
    },
    {
      code: 6005;
      name: "NoParticipants";
      msg: "There are no No Participants";
    },
    {
      code: 6006;
      name: "NoWinner";
      msg: "Only Winner can claim Prize";
    },
    {
      code: 6007;
      name: "WrongTime";
      msg: "Raffle ended";
    }
  ];
};

export const IDL: AtozRaffle = {
  version: "0.1.0",
  name: "atoz_raffle",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "raffleAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "prizeTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "prizeMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "signerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "editionAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mplTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "totalSupply",
          type: "u64",
        },
        {
          name: "ticketPrice",
          type: "u64",
        },
        {
          name: "startTime",
          type: "i64",
        },
        {
          name: "endTime",
          type: "i64",
        },
        {
          name: "name",
          type: "string",
        },
        {
          name: "prize",
          type: "publicKey",
        },
        {
          name: "useTimer",
          type: "bool",
        },
        {
          name: "useSplPay",
          type: "bool",
        },
      ],
    },
    {
      name: "buyTicket",
      accounts: [
        {
          name: "raffleAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ticket",
          isMut: true,
          isSigner: true,
        },
        {
          name: "treasuryAccount",
          isMut: true,
          isSigner: false,
          docs: ["CHECK"],
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "lamports",
          type: "u64",
        },
      ],
    },
    {
      name: "changeVisibility",
      accounts: [
        {
          name: "raffleAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "visible",
          type: "bool",
        },
      ],
    },
    {
      name: "buyTicketSpl",
      accounts: [
        {
          name: "raffleAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ticket",
          isMut: true,
          isSigner: true,
        },
        {
          name: "prizeTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "pickWinner",
      accounts: [
        {
          name: "raffleAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "prizeMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeRaffle",
      accounts: [
        {
          name: "account",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destination",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "claimPrize",
      accounts: [
        {
          name: "raffleAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "winner",
          isMut: true,
          isSigner: false,
        },
        {
          name: "prizeMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "winnerAdr",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: false,
        },
        {
          name: "prizeTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "raffle",
      type: {
        kind: "struct",
        fields: [
          {
            name: "useSplPay",
            type: "bool",
          },
          {
            name: "winner",
            type: "publicKey",
          },
          {
            name: "totalSuppy",
            type: "u64",
          },
          {
            name: "ticketsBought",
            type: "u64",
          },
          {
            name: "ticketPrice",
            type: "u64",
          },
          {
            name: "startTime",
            type: "i64",
          },
          {
            name: "endTime",
            type: "i64",
          },
          {
            name: "participantsList",
            type: {
              vec: {
                defined: "Participants",
              },
            },
          },
          {
            name: "treasury",
            type: "publicKey",
          },
          {
            name: "claimed",
            type: "bool",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "ticketList",
            type: {
              vec: {
                defined: "TicketBought",
              },
            },
          },
          {
            name: "prize",
            type: "publicKey",
          },
          {
            name: "open",
            type: "bool",
          },
          {
            name: "useTimer",
            type: "bool",
          },
          {
            name: "visible",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "ticket",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "ticketId",
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "Participants",
      type: {
        kind: "struct",
        fields: [
          {
            name: "participant",
            type: "publicKey",
          },
          {
            name: "ticketsBought",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "TicketBought",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "ticketId",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "WinnerAlreadyExists",
      msg: "Winner already exists.",
    },
    {
      code: 6001,
      name: "NoTickets",
      msg: "Can't choose a winner when there are no tickets.",
    },
    {
      code: 6002,
      name: "WinnerNotChosen",
      msg: "Winner has not been chosen.",
    },
    {
      code: 6003,
      name: "InvalidWinner",
      msg: "Invalid winner.",
    },
    {
      code: 6004,
      name: "AlreadyClaimed",
      msg: "The prize has already been claimed.",
    },
    {
      code: 6005,
      name: "NoParticipants",
      msg: "There are no No Participants",
    },
    {
      code: 6006,
      name: "NoWinner",
      msg: "Only Winner can claim Prize",
    },
    {
      code: 6007,
      name: "WrongTime",
      msg: "Raffle ended",
    },
  ],
};
