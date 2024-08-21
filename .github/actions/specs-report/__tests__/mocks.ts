export const TBDEX_TEST_VECTORS_FILES = [
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-balance.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-cancel.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-close.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-offering.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-order.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-orderinstructions.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-orderstatus.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-quote.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq-omit-private-data.json',
  '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq.json'
]

export const SUCCESS_MOCK = {
  junitFiles: [`${__dirname}/assets/tbdex-js-results-success.xml`],
  vectors: {
    missingVectors: [],
    failedVectors: [],
    skippedVectors: [],
    successVectors: [
      {
        category: 'protocol',
        name: 'parse_balance',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-balance.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_balance',
            time: 0,
            classname: 'parse_balance'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_cancel',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-cancel.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_cancel',
            time: 0.001,
            classname: 'parse_cancel'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_close',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-close.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_close',
            time: 0,
            classname: 'parse_close'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_offering',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-offering.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_offering',
            time: 0.001,
            classname: 'parse_offering'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_order',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-order.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_order',
            time: 0,
            classname: 'parse_order'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_orderinstructions',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-orderinstructions.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_orderinstructions',
            time: 0.001,
            classname: 'parse_orderinstructions'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_orderstatus',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-orderstatus.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_orderstatus',
            time: 0,
            classname: 'parse_orderstatus'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_quote',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-quote.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_quote',
            time: 0,
            classname: 'parse_quote'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_rfq_omit_private_data',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq-omit-private-data.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_rfq_omit_private_data',
            time: 0,
            classname: 'parse_rfq_omit_private_data'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_rfq',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_rfq',
            time: 0.001,
            classname: 'parse_rfq'
          }
        ]
      }
    ]
  }
}

export const FAILURE_MOCK = {
  junitFiles: [`${__dirname}/assets/tbdex-js-results-failure.xml`],
  vectors: {
    missingVectors: [
      {
        category: 'protocol',
        name: 'parse_close',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-close.json',
        testCases: []
      },
      {
        category: 'protocol',
        name: 'parse_offering',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-offering.json',
        testCases: []
      }
    ],
    failedVectors: [
      {
        category: 'protocol',
        name: 'parse_cancel',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-cancel.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_cancel',
            time: 0.001,
            classname: 'parse_cancel',
            failure: [
              {
                inner:
                  'AssertionError: expected true to be false\n    at Context.<anonymous> (tests/test-vectors.spec.ts:43:47)\n\n      + expected - actual\n\n      -true\n      +false\n      ',
                message: 'expected true to be false',
                type: 'AssertionError'
              }
            ]
          }
        ]
      }
    ],
    skippedVectors: [],
    successVectors: [
      {
        category: 'protocol',
        name: 'parse_balance',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-balance.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_balance',
            time: 0,
            classname: 'parse_balance'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_order',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-order.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_order',
            time: 0.001,
            classname: 'parse_order'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_orderinstructions',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-orderinstructions.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_orderinstructions',
            time: 0,
            classname: 'parse_orderinstructions'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_orderstatus',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-orderstatus.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_orderstatus',
            time: 0,
            classname: 'parse_orderstatus'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_quote',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-quote.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_quote',
            time: 0.001,
            classname: 'parse_quote'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_rfq_omit_private_data',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq-omit-private-data.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_rfq_omit_private_data',
            time: 0,
            classname: 'parse_rfq_omit_private_data'
          }
        ]
      },
      {
        category: 'protocol',
        name: 'parse_rfq',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq.json',
        testCases: [
          {
            name: 'TbdexTestVectorsProtocol parse_rfq',
            time: 0,
            classname: 'parse_rfq'
          }
        ]
      }
    ]
  }
}
