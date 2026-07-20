// @justscaffold:imports

export interface GreetOptions {
  excited?: boolean;
}

export function greet(name: string, options: GreetOptions = {}): string {
  return `Hello, ${name}${options.excited ? "!" : "."}`;
}

// @justscaffold:exports
