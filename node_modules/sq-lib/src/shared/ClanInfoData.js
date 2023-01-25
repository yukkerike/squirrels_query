//  Module:     ClanInfoData
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const ClanInfoData = [
    {
        type: 'ID',
        name: 'id',
        signature: 'Int',
        mask: 0
    },
    {
        type: 'INFO',
        name: 'info',
        signature: [
            'container',
            [
                {
                    name: 'name',
                    type: 'String'
                },
                {
                    name: 'photo',
                    type: 'String'
                },
                {
                    name: 'emblem',
                    type: 'String'
                }
            ]
        ],
        count: 3,
        mask: 1
    },
    {
        type: 'NEWS',
        name: 'news',
        signature: 'String',
        mask: 2
    },
    {
        type: 'LEADER-ID',
        name: 'leader_id',
        signature: 'Int',
        mask: 4
    },
    {
        type: 'SIZE',
        name: 'size',
        signature: 'Int',
        mask: 8
    },
    {
        type: 'STATE',
        name: 'state',
        signature: 'Byte',
        mask: 16
    },
    {
        type: 'RANK',
        name: 'rank',
        signature: [
            'container',
            [
                {
                    name: 'level',
                    type: 'Byte'
                },
                {
                    name: 'exp',
                    type: 'Int'
                },
                {
                    name: 'dailyExp',
                    type: 'Int'
                }
            ]
        ],
        count: 3,
        mask: 32
    },
    {
        type: 'RANK_RANGE',
        name: 'rank_range',
        signature: 'Int',
        mask: 64
    },
    {
        type: 'PLACES',
        name: 'places',
        signature: "Int",
        mask: 128
    },
    {
        type: 'BAN',
        name: 'ban',
        signature: 'Int',
        mask: 256
    },
    {
        type: 'TOTEMS',
        name: 'totems',
        signature: [
            'container',
            [
                {
                    name: 'slotData',
                    type: [
                        'array',
                        {
                            countType: 'UInt',
                            type: [
                                'container',
                                [
                                    {
                                        name: 'slot_id',
                                        type: 'Byte'
                                    },
                                    {
                                        name: 'expires',
                                        type: 'Int'
                                    },
                                    {
                                        name: 'totem_id',
                                        type: 'Byte'
                                    }
                                ]
                            ]
                        },
                    ]
                },
                {
                    name: 'boosterExpires',
                    type: 'Int'
                }
            ]
        ],
        count: 2,
        mask: 512
    },
    {
        type: 'TOTEM_RANGS',
        name: 'totem_rangs',
        signature: [
            'array',
            {
                countType: 'UInt',
                type: [
                    'container',
                    [
                        {
                            name: 'totem_id',
                            type: 'Byte'
                        },
                        {
                            name: 'level',
                            type: 'Byte'
                        },
                        {
                            name: 'exp',
                            type: 'Int'
                        },
                        {
                            name: 'max_exp',
                            type: 'Int'
                        }
                    ]
                ]
            }
        ],
        mask: 1024
    },
    {
        type: 'TOTEMS_BONUSES',
        name: 'totems_bonuses',
        signature: [
            'array',
            {
                countType: 'UInt',
                type: [
                    'container',
                    [
                        {
                            name: 'totem_id',
                            type: 'Byte'
                        },
                        {
                            name: 'bonus',
                            type: 'Byte'
                        }
                    ]
                ]
            }
        ],
        mask: 2048
    },
    {
        type: 'STATISICS',
        name: 'statistics',
        signature: [
            'array',
            {
                countType: 'UInt',
                type: [
                    'container',
                    [
                        {
                            name: 'uid',
                            type: 'Int'
                        },
                        {
                            name: 'exp',
                            type: 'Int'
                        },
                        {
                            name: 'samples',
                            type: 'Int'
                        }
                    ]
                ]
            }
        ],
        mask: 4096
    },
    {
        type: 'BLACKLIST',
        name: 'blacklist',
        signature: [ 'array', { countType: 'UInt', type: 'Int' } ],
        mask: 8192
    },
    {
        type: 'LEVEL_LIMITER',
        name: 'level_limiter',
        signature: 'Byte',
        mask: 16384
    },
    {
        type: 'ADMIN_BALANCE',
        name: 'balance',
        signature: [
            'container',
            [
                {
                    name: 'coins',
                    type: 'Int'
                },
                {
                    name: 'nuts',
                    type: 'Int'
                }
            ]
        ],
        mask: 32768
    },
    {
        type: 'ALL',
        mask: 65535
    }
]

module.exports = {
    ClanInfoData: ClanInfoData
}