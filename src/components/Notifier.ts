type Listener<T extends any[] = any> = (...args: T) => void;

export function debounce<T = any, A extends any[] = any>(
  time: number,
  call: (...args: A) => T
) {
  let timeout: NodeJS.Timeout;
  return (...args: A) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => call(...args), time);
  };
}

export class Notifier<T extends any[] = any> {
  private $listeners = Array<Listener<T>>();

  get hasListen() {
    return this.$listeners.length > 0;
  }

  addListen(listener: Listener<T>) {
    this.$listeners.push(listener);
    return () => this.$listeners.remove(listener);
  }

  removeListen(listener: Listener<T>) {
    this.$listeners.remove(listener);
  }

  notify(...args: T) {
    this.$listeners.forEach((call) => call(...args));
  }

  dispose() {
    this.$listeners = [];
  }
}

export class ValueChanged<T> extends Notifier {
  constructor(private $value: T) {
    super();
  }

  get value() {
    return this.$value;
  }

  set value(value) {
    if (this.value !== value) {
      this.$value = value;
      this.notify(value);
    }
  }

  dispose() {
    super.dispose();
    delete (this as any).$value;
  }
}

export class FlagsChanged extends Notifier<[any, any]> {
  private $flags = {} as { [key in keyof this]: this[key] };

  addListen<K extends keyof this>(listener: (key: K, value: this[K]) => void) {
    return super.addListen(listener);
  }

  notify<K extends keyof this>(key: K, value: this[K]) {
    super.notify(key, value);
  }

  protected makeFlags<K extends keyof this>(...keys: K[]) {
    const { $flags } = this;
    keys.forEach((key) => {
      $flags[key] = this[key];
      Object.defineProperty(this, key, {
        get: () => $flags[key],
        set: (value) => {
          if ($flags[key] !== value) {
            $flags[key] = value;
            this.notify(key, value);
          }
        },
      });
    });
  }
}
