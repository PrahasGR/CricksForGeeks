import matchBallsSchema from "../model/matchBall.model.js";
import matchStats from "../model/matchstats.model.js";
import matches from "../model/matches.model.js";

const addBall = async (req, res) => {
  try {
    const match = req.params.id
    // Destructure incoming ball data (including innings indicator)
    const {
      ballNo,
      batsman,        
      bowler,
      runs,
      wicket,
      batsmanOut,
      byes,
      lb,
      wide,
      noBall,
      is_four,
      is_six,
      innings      // 1 for first innings, 2 for second innings
    } = req.body;



    // Create a new ball record in the ball-by-ball table
    const newBall = await matchBallsSchema.create({
      ballNo,
      batsman,
      match,
      bowler,
      runs,
      wicket,
      batsmanOut: wicket ? batsmanOut : null,
      byes,
      lb,
      wide,
      noBall,
      is_four,
      is_six
    });

    // -------------------------------
    // Update the Batsman's Stats
    // -------------------------------
    let batsmanStats = await matchStats.findOne({
      where: { matchId: match, playerId: batsman }
    });
    if (!batsmanStats) {
      batsmanStats = await matchStats.create({
        matchId: match,
        playerId: batsman,
        roleInMatch: 'batsman'
      });
    }
    // Update batsman's runs
    batsmanStats.runs += runs;
    // Update balls faced only if the delivery is legal (not a wide or noBall)
    if (!wide && !noBall) {
      batsmanStats.ballsFaced += 1;
    }
    // Update boundaries: fours and sixes
    if (is_four) {
      batsmanStats.fours += 1;
    }
    if (is_six) {
      batsmanStats.sixes += 1;
    }
    // Recalculate batting strike rate if balls faced is greater than zero
    if (batsmanStats.ballsFaced > 0) {
      batsmanStats.battingStrikeRate = (batsmanStats.runs / batsmanStats.ballsFaced) * 100;
    }
    await batsmanStats.save();

    // -------------------------------
    // Update the Bowler's Stats
    // -------------------------------
    let bowlerStats = await matchStats.findOne({
      where: { matchId: match, playerId: bowler }
    });
    if (!bowlerStats) {
      bowlerStats = await matchStats.create({
        matchId: match,
        playerId: bowler,
        roleInMatch: 'bowler'
      });
    }
    // Count legal balls (i.e. not wide or noBall)
    if (!wide && !noBall) {
      bowlerStats.ballsBowled += 1;
    }
    // Update runs given: exclude extras like byes and leg-byes
    bowlerStats.runsGiven += (runs - (byes || 0) - (lb || 0));
    // Credit wicket if one was taken
    if (wicket) {
      bowlerStats.wicketsTaken += 1;
    }
    // Update extras: wides and noBalls
    if (wide) {
      bowlerStats.widesBowled += 1;
    }
    if (noBall) {
      bowlerStats.noBalls += 1;
    }
    await bowlerStats.save();

    // -------------------------------
    // Update the Match Record
    // -------------------------------
    let matchRecord = await matches.findOne({ where: { id: match } });
    if (matchRecord) {
      if (innings === 1) {
        // Update first innings stats
        if (!wide && !noBall) {
          matchRecord.firstInningsBalls = (matchRecord.firstInningsBalls || 0) + 1;
        }
        matchRecord.firstInningsScore = (matchRecord.firstInningsScore || 0) + runs;
        if (wicket) {
          matchRecord.firstInningsWickets = (matchRecord.firstInningsWickets || 0) + 1;
        }
      } else if (innings === 2) {
        // Update second innings stats
        if (!wide && !noBall) {
          matchRecord.secondInningsBalls = (matchRecord.secondInningsBalls || 0) + 1;
        }
        matchRecord.secondInningsScore = (matchRecord.secondInningsScore || 0) + runs;
        if (wicket) {
          matchRecord.secondInningsWickets = (matchRecord.secondInningsWickets || 0) + 1;
        }
      }
      await matchRecord.save();
    }

    return res.status(201).json({
      message: 'Ball recorded and statistics updated successfully',
      data: newBall
    });
  } catch (error) {
    console.error('Error updating ball:', error);
    return res.status(500).json({
      message: 'Failed to record ball',
      error: error.message
    });
  }
};
export default addBall;