import { Response } from "express";
import Long from "long";
import { Writer } from "protobufjs";


// sendResponse(message, res): Void
// Sends the server response to the client
export function sendResponse(message: Writer, res: Response)
{
    // Get the end of the message
    let end = message.finish();

    // Built the response data
    let r = res
        .header('Server', 'v388 wangan')
        .header('Content-Type', 'application/x-protobuf; revision=12056')
        .header('Content-Length', end.length.toString())
        .status(200);

    // Send the response to the client
    r.send(Buffer.from(end));
}


// getBigIntFromLong(n: any): number
// Given a Long data object, converts 
// it into a number/BigInt representation safely.
export function getBigIntFromLong(n: any): number
{
    if (n === null || n === undefined) return 0;
    if (typeof n === 'number') return n;
    if (typeof n === 'bigint') return Number(n);
    if (typeof n === 'string') return Number(BigInt(n));
    if (n && typeof n.toString === 'function') {
        try {
            return Number(BigInt(n.toString()));
        } catch (e) {}
    }
    if (n && typeof n.high === 'number' && typeof n.low === 'number') {
        const high = BigInt(n.high >>> 0);
        const low = BigInt(n.low >>> 0);
        return Number((high << 32n) | low);
    }
    return 0;
}


export function sanitizeInput(value: any)
{
    return (value == null || value == undefined) ? undefined : value;
}


export function sanitizeInputNotZero(value: any)
{
    return (value !== null && value !== undefined && value !== 0) ? value : undefined;
}


export function getTimeStamp(date: Date = new Date())
{
    // Return a timestamp string for the current / provided time
    return String("[" + date.toLocaleString() + "]");
}
