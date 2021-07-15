/* eslint-disable no-extend-native */
declare global {
  interface Array<T> {
    readonly first?: T;
    readonly last?: T;
    remove(item: T): T | undefined;
    findBinary(
      test: (item: T, index: number) => number,
      start?: number,
      end?: number
    ): number;
  }
}

Object.defineProperties(Array.prototype, {
  first: {
    get() {
      return this[0];
    },
  },
  last: {
    get() {
      return this[this.length - 1];
    },
  },
  remove: {
    value(item: any) {
      return this.splice(this.indexOf(item), 1)[0];
    },
  },
  findBinary: {
    value(test: (item: any, index: number) => number, start = 0, end?: number) {
      const arr = this as any[];
      end = end ?? arr.length - 1;
      const search = (start: number, end: number): number => {
        if (start > end) return -1;
        let mid = Math.floor((start + end) / 2);
        const tested = test(arr[mid], mid);
        if (tested === 0) return mid;
        if (tested > 0) return search(start, mid - 1);
        return search(mid + 1, end);
      };

      return search(start, end);
    },
  },
});

export {};
