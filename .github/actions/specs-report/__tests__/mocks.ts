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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
        name: 'parse_close',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-close.json',
        testCases: []
      },
      {
        feature: 'Protocol',
        name: 'parse_offering',
        file: '/home/runner/work/tbdex-js/tbdex-js/tbdex/hosted/test-vectors/protocol/vectors/parse-offering.json',
        testCases: []
      }
    ],
    failedVectors: [
      {
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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
        feature: 'Protocol',
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

export const WEB5_KT_JUNIT_FILES = [
  `${__dirname}/assets/web5-kt-web5.sdk.credentials.Web5TestVectorsCredentials.xml`,
  `${__dirname}/assets/web5-kt-web5.sdk.credentials.Web5TestVectorsPresentationExchange.xml`
]

export const WEB5_TEST_VECTORS_FILES = [
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/credentials/create.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/credentials/verify.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_ed25519/sign.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_ed25519/verify.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_es256k/sign.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_es256k/verify.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/did_dht/create.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/did_dht/resolve.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/did_jwk/resolve.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/did_web/resolve.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/portable_did/parse.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/create_presentation_from_credentials.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/evaluate_presentation.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/select_credentials.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/validate_definition.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/validate_submission.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/vc_jwt/decode.json',
  '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/vc_jwt/verify.json'
]

export const WEB5_TEST_VECTORS_FEATURES = {
  Credentials: ['create', 'verify'],
  CryptoEd25519: ['sign', 'verify'],
  CryptoEs256k: ['sign', 'verify'],
  DidDht: ['create', 'resolve'],
  DidJwk: ['resolve'],
  DidWeb: ['resolve'],
  PortableDid: ['parse'],
  PresentationExchange: [
    'create_presentation_from_credentials',
    'evaluate_presentation',
    'select_credentials',
    'validate_definition',
    'validate_submission'
  ],
  VcJwt: ['decode', 'verify']
}
