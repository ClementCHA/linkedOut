# Patterns Avancés

## Domain Events

```typescript
// domain/events/DomainEvent.ts
export interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventType: string;
}

// domain/events/OrderCreatedEvent.ts
export class OrderCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  readonly eventType = 'OrderCreated';

  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId
  ) {}
}
```

## Aggregate Root

```typescript
// domain/entities/AggregateRoot.ts
export abstract class AggregateRoot<TId> {
  private _domainEvents: DomainEvent[] = [];

  constructor(public readonly id: TId) {}

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
```

## Result Pattern (au lieu d'exceptions)

```typescript
// domain/shared/Result.ts
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ success: true, value }),
  fail: <E>(error: E): Result<never, E> => ({ success: false, error }),
};

// Usage
class EmailAddress {
  static create(email: string): Result<EmailAddress, InvalidEmailError> {
    if (!this.isValid(email)) {
      return Result.fail(new InvalidEmailError(email));
    }
    return Result.ok(new EmailAddress(email));
  }
}
```

## Specification Pattern

```typescript
// domain/specifications/Specification.ts
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

// domain/specifications/OrderSpecifications.ts
export class OrderIsReadyForShipment implements Specification<Order> {
  isSatisfiedBy(order: Order): boolean {
    return (
      order.status === OrderStatus.Paid &&
      order.items.length > 0 &&
      order.shippingAddress !== null
    );
  }
}
```

## Unit of Work Pattern

```typescript
// domain/ports/IUnitOfWork.ts
export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Usage in Use Case
export class TransferMoneyUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(command: TransferCommand): Promise<void> {
    await this.unitOfWork.begin();
    try {
      const from = await this.accountRepository.findById(command.fromId);
      const to = await this.accountRepository.findById(command.toId);

      from.withdraw(command.amount);
      to.deposit(command.amount);

      await this.accountRepository.save(from);
      await this.accountRepository.save(to);
      await this.unitOfWork.commit();
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
```
