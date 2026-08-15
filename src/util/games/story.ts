import Long from "long";
import { prisma } from "../..";

// Import Proto
import { wm } from "../../wmmt/wm.proto";

// Import Util
import * as common from "../common";
import * as check_step from "../games/games_util/check_step";


// Save story result
export async function saveStoryResult(body: wm.protobuf.SaveGameResultRequest, car: any)
{
    // If the game was not retired / timed out
    if (!(body.retired || body.timeup)) 
    {
        console.log('Game not retired / timed out, continuing ...')

        // Get the story result for the car
        let storyResult = body?.stResult;
        let stLoseBits;

        // storyResult is set
        if (storyResult)
        {
            // Story update data
            let data : any = {
                stClearDivCount: common.sanitizeInput(storyResult.stClearDivCount), 
                stPlayCount: common.sanitizeInput(storyResult.stPlayCount), 
                stClearCount: common.sanitizeInput(storyResult.stClearCount), 
                stConsecutiveWins: common.sanitizeInput(storyResult.stConsecutiveWins), 
                tuningPoints: common.sanitizeInput(storyResult.tuningPoint), 
                stCompleted100Episodes: common.sanitizeInput(storyResult.stCompleted_100Episodes), 
            }

            // If the current consecutive wins is greater than the previous max
            if (storyResult.stConsecutiveWins !== null && storyResult.stConsecutiveWins !== undefined) 
            {
                if (storyResult.stConsecutiveWins > (car?.stConsecutiveWinsMax || 0)) 
                {
                    // Update the maximum consecutive wins;
                    data.stConsecutiveWinsMax = storyResult.stConsecutiveWins;
                }
            }

            // Lose bits handling
            if (storyResult.stLoseBits !== null && storyResult.stLoseBits !== undefined)
            {
                data.stLoseBits = common.getBigIntFromLong(storyResult.stLoseBits);
                stLoseBits = data.stLoseBits;
                if (stLoseBits > 0)
                {
                    // End the win streak
                    data.stConsecutiveWins = 0;
                }
            }
            else
            {
                stLoseBits = 0;
            }

            // Calling check step function
            let check_steps = await check_step.checkCurrentStep(body);

            // Set the ghost level to the correct level
            data.ghostLevel = check_steps.ghostLevel;

            // Check if clearBits is set
            if (storyResult.stClearBits !== null && storyResult.stClearBits !== undefined)
            {
                data.stClearBits = storyResult.stClearBits;
            }

            console.log('Updating story data');
            
            // Update the car properties
            await prisma.car.update({
                where: {
                    carId: body.carId
                },
                data: data
            });
        }
    }
}
