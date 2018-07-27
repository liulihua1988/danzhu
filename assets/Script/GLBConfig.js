/* 存放全局变量 */
var _GLBConfig = {
    MAX_PLAYER_COUNT: 3,
    GAME_START_EVENT: "gameStart",
    NEW_START_EVENT: "newStar",
    PLAYER_MOVE_EVENT: "playerMove",
    GAIN_SCORE_EVENT: "gainScore",
    PLAYER_POSITION_EVENT: "playerPosition",
    PLAYER_ACTION:"playerAction",
    ARROW_POSITION_EVENT:"arrowPosition",
    PLAYER_CHANGE_SKIN:"playerChangeSkin",

    channel: 'MatchVS',
    platform: 'alpha',
    gameId: 201556,
    gameVersion: 1,
    appKey: 'c603b1fae5274ee2972958e8a773a95d',
    secret: '8dbce7620f574eb8a8dd159ba2a43c85',

    userInfo: null,
    playerUserIds: [],
    isRoomOwner: false,
    events: {},
};
module.exports = _GLBConfig;