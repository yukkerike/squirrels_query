//  Module:     PlayerInfoData
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const PlayerInfoData = [
    {
        type: 'UID',
        name: 'uid',
        signature: 'Int',
        mask: 0
    },
    {
        type: 'NET_ID',
        name: 'nid',
        signature: 'ULong',
        mask: 1
    },
    {
        type: 'TYPE',
        name: 'type',
        signature: 'Byte',
        mask: 2
    },
    {
        type: 'MODERATOR',
        name: 'moderator',
        signature: 'Byte',
        mask: 4
    },
    {
        type: 'NAME',
        name: 'name',
        signature: 'String',
        mask: 8
    },
    {
        type: 'SEX',
        name: 'sex',
        signature: 'Byte',
        mask: 16
    },
    {
        type: 'PHOTO',
        name: 'photo_big',
        signature: 'String',
        mask: 32
    },
    {
        type: 'ONLINE',
        name: 'online',
        signature: 'Byte',
        mask: 64
    },
    {
        type: 'INFO',
        name: 'person_info',
        signature: [
            'container',
            [
                {
                    name: 'bdate',
                    type: 'Int'
                },
                {
                    name: 'profile',
                    type: 'String'
                },
                {
                    name: 'referrer',
                    type: 'Int'
                }
            ]
        ],
        count: 3,
        mask: 128
    },
    {
        type: 'EXPERIENCE',
        name: 'exp',
        signature: 'Int',
        mask: 256
    },
    {
        type: 'WEARED',
        name: 'weared',
        signature: [
            'container',
            [
                {
                    name: 'weared_packages',
                    type: [ 'array', { countType: 'UInt', type: 'Short' } ]
                },
                {
                    name: 'weared_accessories',
                    type: [ 'array', { countType: 'UInt', type: 'Short' } ]
                }
            ]
        ],
        count: 2,
        mask: 512
    },
    {
        type: 'CLAN',
        name: 'clan_id',
        signature: 'Int',
        mask: 1024
    },
    {
        type: 'COLLECTION_EXCHANGE',
        name: 'collection_exchange',
        signature: [ 'array', { countType: 'UInt', type: 'Byte' } ],
        mask: 2048
    },
    {
        type: 'IS_GONE',
        name: 'is_gone',
        signature: 'Byte',
        mask: 4096
    },
    {
        type: 'CLAN_TOTEM',
        name: 'clan_totem',
        signature: 'Int',
        mask: 8192
    },
    {
        type: 'VIP_INFO',
        name: 'vip_info',
        signature: [
            'container',
            [
                {
                    name: 'vip_exist',
                    type: 'Byte'
                },
                {
                    name: 'vip_color',
                    type: 'Byte'
                }
            ]
        ],
        count: 2,
        mask: 16384
    },
    {
        type: 'INTERIOR',
        name: 'interior',
        signature: [ 'array', { countType: 'UInt', type: 'Byte' } ],
        mask: 32768
    },
    {
        type: 'SHAMAN_EXP',
        name: 'shaman_exp',
        signature: 'Int',
        mask: 65536
    },
    {
        type: 'SHAMAN_SKILLS',
        name: 'shaman_skills',
        signature: [
            'array',
            {
                countType: 'UInt',
                type: [
                    'container',
                    [
                        {
                            name: 'skillId',
                            type: 'Byte'
                        },
                        {
                            name: 'levelFree',
                            type: 'Byte'
                        },
                        {
                            name: 'levelPaid',
                            type: 'Byte'
                        }
                    ]
                ]
            }
        ],
        mask: 131072
    },
    {
        type: 'RATING_INFO',
        name: 'rating_info',
        signature: [
            'container',
            [
                {
                    name: 'rating_score',
                    type: 'Int'
                },
                {
                    name: 'rating_player',
                    type: 'Int'
                },
                {
                    name: 'rating_shaman',
                    type: 'Int'
                }
            ]
        ],
        count: 3,
        mask: 262144
    },
    {
        type: 'RATING_HISTORY',
        name: 'rating_history',
        signature: [
            'array',
            {
                countType: 'UInt',
                type: [
                    'container',
                    [
                        {
                            name: 'season',
                            type: 'Short'
                        },
                        {
                            name: 'rating',
                            type: 'Int'
                        }
                    ]
                ]
            }
        ],
        mask: 524288
    },
    {
        type: 'RATING_HOLIDAY',
        name: 'rating_holiday',
        signature: 'Int',
        mask: 1048576
    },
    {
        type: 'TROPHIES',
        name: 'trophies',
        signature: [
            'array',
            {
                countType: 'UInt',
                type: [
                    'container',
                    [
                        {
                            name: 'event',
                            type: 'Byte'
                        },
                        {
                            name: 'subIndex',
                            type: 'Short'
                        },
                        {
                            name: 'trophy',
                            type: 'Byte'
                        }
                    ]
                ]
            }
        ],
        mask: 2097152
    },
    {
        type: 'ALL',
        mask: 4194303
    }
]

module.exports = {
    PlayerInfoData: PlayerInfoData
}