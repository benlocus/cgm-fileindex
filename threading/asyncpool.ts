import { pooledMap } from "https://deno.land/std@0.166.0/async/pool.ts";


async function collectAsyncIterable<T>(
    iterator: AsyncIterable<T>
  ): Promise<T[]> {
    const collected = [] as T[];
    for await (const v of iterator) {
      collected.push(v);
    }
    return collected;
  }
  
  const iter = [...Array(100).keys()];
  
  async function cb_uncaught(i: number): Promise<number> {
    return new Promise((resolve, reject) => {
        if (i % 2 ===0) {
            setTimeout(() => { resolve(i) }, 2000);
            console.log(`Even number: ${i}, took 2 seconds`)
        } else {
            setTimeout(() => { resolve(i) }, 200);
            console.log(`Even number: ${i}, took 0.2 seconds`)
        }
    });
  }
  
  async function cb_caught(i: number): Promise<number> {
    if (i === 42) throw new Error("can't handle the wisdom");
    return i;
  }
  
  try {
    await collectAsyncIterable(
      pooledMap(10, iter, async (num) => {
        await cb_uncaught(num);
        // await cb_caught(num);
      })
    );
  } catch (err) {
    console.error("caught", err);
  }