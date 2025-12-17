export type Left<L> = { _tag: 'Left'; left: L };
export type Right<R> = { _tag: 'Right'; right: R };

export type Either<L, R> = Left<L> | Right<R>;

export const left = <L, R = never>(value: L): Either<L, R> => ({
  _tag: 'Left',
  left: value,
});

export const right = <R, L = never>(value: R): Either<L, R> => ({
  _tag: 'Right',
  right: value,
});

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
  either._tag === 'Left';

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
  either._tag === 'Right';


