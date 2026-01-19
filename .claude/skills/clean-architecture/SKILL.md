---
name: clean-architecture
description: Patterns et structures Clean Architecture. Chargé automatiquement pour création de classes, use cases, repositories.
allowed-tools: Read, Write, Edit, Glob
---

# Clean Architecture Patterns

Utilise ces patterns pour créer du code respectant la Clean Architecture.

## Création d'Entité

```typescript
// domain/entities/[Name].ts
export class Order {
  private constructor(
    public readonly id: OrderId,
    public readonly customerId: CustomerId,
    private _items: ReadonlyArray<OrderItem>,
    private _status: OrderStatus
  ) {}

  // Factory method - seul point de création
  static create(customerId: CustomerId): Order {
    return new Order(
      OrderId.generate(),
      customerId,
      [],
      OrderStatus.Draft
    );
  }

  // Reconstitution depuis persistence
  static reconstitute(
    id: OrderId,
    customerId: CustomerId,
    items: OrderItem[],
    status: OrderStatus
  ): Order {
    return new Order(id, customerId, items, status);
  }

  // Comportement métier encapsulé
  addItem(item: OrderItem): Order {
    if (this._status !== OrderStatus.Draft) {
      throw new OrderNotModifiableError(this.id);
    }
    return new Order(
      this.id,
      this.customerId,
      [...this._items, item],
      this._status
    );
  }

  get items(): ReadonlyArray<OrderItem> {
    return this._items;
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero()
    );
  }
}
```

## Création de Value Object

```typescript
// domain/value-objects/[Name].ts
export class EmailAddress {
  private constructor(private readonly value: string) {}

  static create(email: string): EmailAddress {
    if (!EmailAddress.isValid(email)) {
      throw new InvalidEmailError(email);
    }
    return new EmailAddress(email.toLowerCase().trim());
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

## Création de Port (Interface)

```typescript
// domain/ports/I[Name]Repository.ts
export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}
```

## Création de Use Case

```typescript
// application/use-cases/[VerbNoun]UseCase.ts
export interface CreateOrderCommand {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface ICreateOrderUseCase {
  execute(command: CreateOrderCommand): Promise<OrderDto>;
}

export class CreateOrderUseCase implements ICreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    // 1. Créer l'entité
    const order = Order.create(new CustomerId(command.customerId));

    // 2. Appliquer la logique
    let updatedOrder = order;
    for (const item of command.items) {
      const product = await this.productRepository.findById(
        new ProductId(item.productId)
      );
      if (!product) {
        throw new ProductNotFoundError(item.productId);
      }
      updatedOrder = updatedOrder.addItem(
        OrderItem.create(product, item.quantity)
      );
    }

    // 3. Persister
    await this.orderRepository.save(updatedOrder);

    // 4. Retourner DTO
    return OrderDto.fromEntity(updatedOrder);
  }
}
```

## Création de DTO

```typescript
// application/dtos/[Name]Dto.ts
export class OrderDto {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItemDto[],
    public readonly total: number,
    public readonly status: string
  ) {}

  static fromEntity(order: Order): OrderDto {
    return new OrderDto(
      order.id.toString(),
      order.customerId.toString(),
      order.items.map(OrderItemDto.fromEntity),
      order.total.toNumber(),
      order.status
    );
  }
}
```

## Création d'Adapter (Repository)

```typescript
// infrastructure/repositories/[Name]Repository.ts
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.toString()) ?? null;
  }

  async findByCustomer(customerId: CustomerId): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId.equals(customerId)
    );
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.toString(), order);
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.toString());
  }
}
```

Voir [patterns.md](patterns.md) pour plus d'exemples avancés.
