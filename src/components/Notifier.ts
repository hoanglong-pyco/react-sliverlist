type Void = () => void;

export class Notifier {
  private $listeners = Array<Void>();

  get hasListen() {
    return this.$listeners.length > 0;
  }

  addListen(listener: Void) {
    this.$listeners.push(listener);
    return () => this.$listeners.remove(listener);
  }

  removeListen(listener: Void) {
    this.$listeners.remove(listener);
  }

  notify() {
    this.$listeners.forEach((call) => call());
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
      this.notify();
    }
  }

  dispose() {
    super.dispose();
    delete (this as any).$value;
  }
}
