import { MouseEvent } from "react";
import { Notifier } from "./Notifier";

type Key = string | number;

const cancelTextSelect = (() => {
  if (window.getSelection) {
    return () => {
      const selection = window.getSelection();
      if (selection) {
        if (selection.toString().length) {
          return false;
        }
        selection.empty ? selection.empty() : selection.removeAllRanges?.();
        return true;
      }
    };
  } else {
    const { selection } = document as any;
    if (selection)
      return () => {
        if (selection.createRange().text.length) return false;
        selection.empty();
        return true;
      };
  }
  return () => true;
})();

export class SliverSelection extends Notifier {
  private $indexed: Record<Key, number> = {};
  private $keys: Key[] = [];
  private $selecting: Record<Key, number> = {};
  private $range = { from: -1, to: -1 };

  get selecting() {
    return Object.keys(this.$selecting);
  }

  constructor(keys: Key[] = []) {
    super();
    keys.map(this.add.bind(this));
  }

  private repareIndex(index = 0) {
    const { $keys, $indexed, $selecting } = this;
    for (; index < $keys.length; index++) {
      const key = $keys[index];
      const oldIndex = $indexed[key];
      if (oldIndex !== undefined) {
        $indexed[key] = index;
        if ($selecting[key] !== undefined) {
          $selecting[key] = index;
        }
      } else {
        throw new Error(`Index of ${index} does not exists!`);
      }
    }
  }

  add(key: Key, index?: number) {
    const { $keys, $indexed } = this;
    index = index ?? $keys.length;
    $keys.splice(index, 0, key);
    $indexed[$keys[index]] = index;
    this.repareIndex(index + 1);
  }

  remove(key: Key) {
    const { $keys, $indexed } = this;
    const index = $indexed[key];
    if (index !== undefined) {
      $keys.remove(key);
      delete $indexed[key];
      this.repareIndex(index);
      return true;
    }
    return false;
  }

  empty() {
    this.$keys = [];
    this.$indexed = {};
    this.$selecting = {};
  }
  // ------------------------
  isSelected(key: Key) {
    return this.$selecting[key] !== undefined;
  }

  private setItem(key: Key, value: boolean) {
    const { $selecting, $indexed } = this;
    const index = $indexed[key];
    if (index !== undefined) {
      if (value) {
        $selecting[key] = index;
      } else {
        delete this.$selecting[key];
      }
    } else {
      throw Error(`Entry of key "${key}" does not exists`);
    }
    return index;
  }

  private setItems(keys: Key[], value: boolean) {
    return keys.map((key) => this.setItem(key, value));
  }

  batchSelect(keys: Key[], value: boolean) {}

  handler = (key: Key) => {
    const { $range, $indexed, $keys } = this;
    return (event: MouseEvent<HTMLElement>) => {
      const ctrl = event.metaKey ?? event.ctrlKey;
      if (!cancelTextSelect()) return;
      if (ctrl || event.shiftKey) {
        if (event.shiftKey && $range.from !== -1) {
          const value = this.isSelected($keys[$range.from]);

          const current = $indexed[key];
          const from = Math.min($range.from, current);
          const to = Math.max($range.from, current);
          let min = Math.min(from, $range.to);
          const max = Math.max(to, $range.to);
          for (; min <= max; min++) {
            this.setItem($keys[min], min < from || min > to ? !value : value);
          }
          $range.to = current;
        } else {
          $range.from = $range.to = this.setItem(key, !this.isSelected(key));
        }
        this.notify();
      } else {
        const { selecting } = this;
        if (selecting.length !== 1 || selecting.first !== key) {
          this.setItems(selecting, false);
          this.setItem(key, true);
          this.notify();
        }
        $range.from = $range.to = $indexed[key];
      }
    };
  };
}
