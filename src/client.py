#!/usr/bin/env python

import asyncio
import websockets


async def hello():
    print("connecting…")
    uri = "ws://172.24.164.168:8765"
    async with websockets.connect(uri) as websocket:
        print("connected!")
        while True:
            message = await websocket.recv()
            print(f"<<< {message}")


if __name__ == "__main__":
    asyncio.run(hello())
