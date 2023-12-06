import asyncio
from time import time
import websockets
from websockets.server import serve
import RPi.GPIO as GPIO

ir_pin = 12
sockets = set()


async def connect(websocket):
    sockets.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        sockets.remove(websocket)


def send_to_websockets(msg):
    websockets.broadcast(sockets, msg)


async def main():
    print("Starting server")
    async with serve(connect, "0.0.0.0", 8765):
        setup_ir_receiver()
        await asyncio.Future()  # run forever


def binary_aquire(pin, duration):
    # aquires data as quickly as possible
    t0 = time()
    results = []
    while (time() - t0) < duration:
        results.append(GPIO.input(pin))
    return results


def process_ir_event(pinNo):
    bouncetime = 150
    # when edge detect is called (which requires less CPU than constant
    # data acquisition), we acquire data as quickly as possible
    data = binary_aquire(pinNo, bouncetime / 1000.0)
    if len(data) < bouncetime:
        return
    rate = len(data) / (bouncetime / 1000.0)
    pulses = []
    i_break = 0
    # detect run lengths using the acquisition rate to turn the times in to microseconds
    for i in range(1, len(data)):
        if (data[i] != data[i - 1]) or (i == len(data) - 1):
            pulses.append((data[i - 1], int((i - i_break) / rate * 1e6)))
            i_break = i
    # decode ( < 1 ms "1" pulse is a 1, > 1 ms "1" pulse is a 1, longer than 2 ms pulse is something else)
    # does not decode channel, which may be a piece of the information after the long 1 pulse in the middle
    outbin = ""
    for val, us in pulses:
        if val != 1:
            continue
        if outbin and us > 2000:
            break
        elif us < 1000:
            outbin += "0"
        elif 1000 < us < 2000:
            outbin += "1"
    try:
        return int(outbin, 2)
    except ValueError:
        return None


def on_ir_receive(pinNo):
    code = process_ir_event(pinNo)
    if code:
        print(f"Sending received code to all connected clients: {str(hex(code))}")
        send_to_websockets(str(hex(code)))
    else:
        print("Invalid code")


def setup_ir_receiver():
    print("Setting up Listener…")
    GPIO.setmode(GPIO.BOARD)  # Numbers GPIOs by physical location
    GPIO.setup(ir_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    print("Starting IR Listener…")
    GPIO.add_event_detect(ir_pin, GPIO.FALLING)
    GPIO.add_event_callback(ir_pin, on_ir_receive)
    print("IR Listener started. Waiting for input…")


asyncio.run(main())
