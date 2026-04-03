---
name: sofware-engenier
description: WORKFLOW SKILL — Software architecture, system design, and design patterns. USE FOR: selecting design patterns, reducing coupling, evaluating maintainability, scaling code, modeling responsibilities between modules, and reviewing architecture in React, Node.js, and backend systems. KEYWORDS: singleton, factory, builder, prototype, adapter, facade, proxy, observer, strategy, command, state, mediator, iterator, SOLID, coupling, cohesion, maintainability, testability, software architecture.
---
<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

# Software Engineer Skill

This skill is used to reason about software architecture and apply design patterns pragmatically. It should be used when the task requires deciding how to structure objects, services, modules, or collaboration flows between components, with a focus on flexibility, maintainability, scalability, and testability.

## When to use this skill

Use this skill when the request includes one or more of these scenarios:

- Refactoring code that is tightly coupled to concrete implementations.
- Choosing a robust way to create objects or services.
- Extending behavior without modifying existing classes.
- Untangling chaotic dependencies between modules, components, or subsystems.
- Handling business logic that requires swappable algorithms or explicit state transitions.
- Explaining design patterns, SOLID, or software architecture best practices.
- Working in React, Node.js, or backend architecture where classic patterns should be mapped to a modern stack.

## When not to use this skill

Do not use this skill as the first tool for purely mechanical or localized tasks such as:

- Trivial UI changes with no architectural impact.
- Styling, copy, or configuration edits without software design implications.
- Small fixes where introducing a pattern would add complexity without meaningful value.

## Skill objective

The goal of this skill is to help build systems with lower coupling, higher cohesion, and clearer responsibility boundaries. Design patterns should not be introduced as academic formalism, but as reusable solutions to recurring design problems.

## Working principles

- Prioritize solving the real design problem instead of forcing a pattern because it is well known.
- Prefer the simplest option that still keeps the system extensible.
- Always evaluate trade-offs: a pattern may improve flexibility while hurting readability if applied without a clear need.
- Explain why a pattern fits the current problem and why alternatives fit less well.
- Tie every recommendation back to coupling, cohesion, scalability, maintainability, and testability.

## Conceptual foundation

Reference source: https://refactoring.guru/design-patterns

Design patterns are reusable solutions to common software design problems. They are not copy-paste code, but conceptual templates that help developers build flexible, maintainable, and scalable systems without tightly coupling components.

## Architectural criteria to evaluate

### Coupling

Patterns should reduce tight coupling between modules. If a class depends on too many concrete implementations, that is usually a sign of fragile design.

### Cohesion

Each class or module should have one clear and well-defined responsibility. If an object accumulates too many reasons to change, responsibilities should likely be redistributed.

### Scalability

A good pattern allows the system to grow without repeatedly rewriting stable code. The ideal growth model is extension instead of constant modification.

### Maintainability

The structure should make the system easier to read, change safely, and evolve. If the pattern makes the code harder to understand than the original problem, it was probably the wrong choice.

### Testability

Decoupled components are easier to isolate, mock, and test. If a decision reduces testability, that trade-off should be explicit and justified.

## SOLID principles

These principles should be used as a validation framework to determine whether a pattern is being applied correctly:

- Single Responsibility Principle: each unit should have one reason to change.
- Open Closed Principle: the system should be open for extension and closed for modification.
- Liskov Substitution Principle: derived implementations must be substitutable for their abstractions without breaking expected behavior.
- Interface Segregation Principle: interfaces should stay small and specific, without forcing clients to depend on irrelevant methods.
- Dependency Inversion Principle: high-level code should depend on abstractions, not concrete details.

## Pattern categories

### 1. Creational Patterns

Use these when the main problem is how to create objects correctly without coupling the system to concrete classes.

#### Singleton

**Intent**

Ensure that a class has only one instance and provide a global access point to it.

**Problem it solves**

Some resources must exist exactly once within the system, such as global configuration, centralized logging, or connection pools.

**Typical architecture**

- Private static instance variable.
- Private constructor to prevent external instantiation.
- Public static accessor such as `getInstance()`.

**Typical flow**

1. The client calls `getInstance()`.
2. The system checks whether the instance already exists.
3. If it does not exist, it creates it.
4. The existing or newly created instance is returned.

**When to use it**

- Application configuration managers.
- Logging services.
- Database connection pools.
- Shared caching systems.

**Advantages**

- Controlled access to a single instance.
- Global availability.
- Reduced duplication of expensive shared resources.

**Disadvantages**

- Can hide dependencies.
- Makes unit testing harder when overused.
- Can introduce concurrency issues.

**Implementation considerations**

- Validate thread safety.
- Decide between eager and lazy initialization.
- Consider whether dependency injection is a better fit.

#### Factory Method

**Intent**

Define an interface for creating objects while allowing subclasses to decide which concrete class to instantiate.

**Problem it solves**

When code instantiates objects directly with `new`, it becomes tightly coupled to concrete implementations and harder to extend or replace.

**Typical architecture**

- `Product` as an interface or abstraction.
- `ConcreteProduct` implementations.
- Abstract `Creator` with the factory method.
- `ConcreteCreator` classes that decide what product to return.

**Typical flow**

1. The client requests a product from the creator.
2. The creator delegates instantiation to the subclass.
3. The concrete creator returns the appropriate implementation.

**When to use it**

- Extensible frameworks.
- Plugin systems.
- Cases where object creation should be decoupled from object usage.

**Advantages**

- Reduces coupling.
- Supports the Open Closed Principle.
- Improves flexibility.

**Disadvantages**

- Introduces more classes and layers.
- Can over-engineer simple cases.

#### Abstract Factory

**Intent**

Provide an interface for creating families of related objects without depending on their concrete classes.

**Problem it solves**

This is useful when the system must support multiple coherent product families, such as themes, operating system variants, or infrastructure providers.

**Typical architecture**

- `AbstractFactory` with methods for each product type.
- One `ConcreteFactory` per family.
- `AbstractProduct` interfaces for each category.
- `ConcreteProduct` variants.

**When to use it**

- Cross-platform UI frameworks.
- Theming systems.
- Support for multiple databases or providers.

**Advantages**

- Ensures compatibility between related products.
- Decouples client code from concrete implementations.

**Disadvantages**

- Adding a new product type can be expensive because it affects the whole factory hierarchy.

#### Builder

**Intent**

Separate the construction of a complex object from its final representation.

**Problem it solves**

Constructors with too many parameters, conditionals, or optional settings become fragile and difficult to maintain.

**Typical architecture**

- `Builder` as the construction-step interface.
- `ConcreteBuilder` with the real implementation.
- Optional `Director` to orchestrate the sequence.
- `Product` as the final result.

**When to use it**

- Complex objects.
- Step-by-step construction.
- Immutable configuration objects.

**Advantages**

- Makes construction more readable.
- Encapsulates assembly logic.
- Reduces errors caused by incomplete or misordered parameters.

#### Prototype

**Intent**

Create new objects by copying an existing instance.

**Problem it solves**

Useful when creating an object from scratch is expensive, complex, or when a reusable base configuration should be preserved.

**Typical architecture**

- `Prototype` interface.
- `clone()` method.
- Concrete implementations that know how to clone themselves.

**When to use it**

- Object cloning.
- Performance optimization.
- Configuration templates.

### 2. Structural Patterns

Use these when the main problem is how to compose classes and objects into larger structures while keeping them flexible.

#### Adapter

**Intent**

Allow incompatible interfaces to work together.

**Problem it solves**

Common when integrating third-party libraries, legacy systems, or APIs whose contracts do not match the internal model.

**Typical architecture**

- `Target` as the interface expected by the client.
- `Adaptee` as the existing or external system.
- `Adapter` as the translator between the two.

**When to use it**

- Legacy system integration.
- Third-party API compatibility.

#### Bridge

**Intent**

Separate an abstraction from its implementation so both can evolve independently.

**When to use it**

- Multiple platform-specific implementations.
- Separation between business logic and infrastructure.

#### Composite

**Intent**

Compose objects into tree structures to represent part-whole hierarchies.

**When to use it**

- File systems.
- UI component trees.
- Nested domain structures.

#### Decorator

**Intent**

Attach additional responsibilities to an object dynamically without modifying its base class.

**When to use it**

- Middleware pipelines.
- Logging layers.
- Behavior extensions.

#### Facade

**Intent**

Provide a simplified interface to a complex subsystem.

**When to use it**

- Microservice gateways.
- SDKs or wrappers around large subsystems.

#### Proxy

**Intent**

Provide a surrogate object that controls access to another object.

**When to use it**

- Lazy loading.
- Security and access control.
- Communication with remote objects.

### 3. Behavioral Patterns

Use these when the main problem is object communication and how responsibilities are assigned dynamically.

#### Observer

**Intent**

Define a one-to-many dependency so subscribers are automatically notified when an object's state changes.

**Typical architecture**

- `Subject` that emits changes.
- Subscribed `Observers`.
- Subscription system.
- Notification mechanism.

**When to use it**

- Event systems.
- State management.
- UI frameworks.

#### Strategy

**Intent**

Define a family of algorithms and make them interchangeable.

**When to use it**

- Payment processors.
- Sorting algorithms.
- Pricing or discount strategies.

#### Command

**Intent**

Encapsulate a request as an object.

**When to use it**

- Task queues.
- Undo and redo systems.
- Action history.

#### State

**Intent**

Allow an object to alter its behavior when its internal state changes.

**When to use it**

- Workflow engines.
- Finite state machines.

#### Mediator

**Intent**

Reduce chaotic dependencies between components by centralizing communication.

**When to use it**

- Complex UIs.
- Communication hubs.

#### Iterator

**Intent**

Provide a way to traverse a collection sequentially without exposing its internal representation.

**When to use it**

- Collection traversal.
- Custom data structures.

## Practical rules for selecting a pattern

Use these rules as a starting heuristic, not as dogma:

- If object creation is highly complex, consider `Builder`.
- If multiple related object families are required, consider `Abstract Factory`.
- If you need a controlled single global instance, consider `Singleton`.
- If an algorithm must be swappable at runtime or by configuration, consider `Strategy`.
- If multiple objects must react to state changes, consider `Observer`.
- If you need to extend behavior without modifying the original class, consider `Decorator`.

## Mapping to modern frameworks

### React

- `Observer`: state updates and subscriptions to changes.
- `Strategy`: rendering or validation strategies.
- `Composite`: component trees.

### Node.js

- `Singleton`: shared services such as config, logger, or registries.
- `Factory`: decoupled creation of objects, adapters, or clients.
- `Decorator`: middleware and incremental request-handling enrichment.

### Backend architecture

In addition to classic GOF patterns, modern backend systems commonly use complementary architectural patterns:

- `Repository Pattern`: abstracts persistence access.
- `Dependency Injection`: decouples dependency construction from dependency usage.
- `Service Layer Pattern`: organizes use cases and application logic.

## How to respond using this skill

When this skill is active, follow this sequence:

1. Identify the concrete design problem first, not the pattern.
2. Detect the primary pain point: creation, composition, communication, or behavior changes.
3. Evaluate coupling, cohesion, maintainability, and testability in the current approach.
4. Select one or two reasonable pattern candidates at most.
5. Explain why they fit and what cost they introduce.
6. Map the recommendation to the actual stack in the project.
7. If appropriate, propose an incremental refactor instead of a full rewrite.

## Anti-patterns when using this skill

- Do not recommend patterns just because they are famous or elegant.
- Do not introduce extra abstractions if the problem does not justify the cost.
- Do not use `Singleton` as a substitute for poor dependency management.
- Do not use `Abstract Factory` if there is only one real product family.
- Do not turn every small variation into a deep class hierarchy.

## Recommended response format

When the user asks for architecture guidance, respond with this structure when appropriate:

### Problem

Describe the real design problem.

### Recommended pattern

Name the pattern and explain why it fits.

### Why it fits

Relate the recommendation to coupling, cohesion, scalability, maintainability, and testability.

### Trade-offs

Explain what complexity it adds and when it is not worth using.

### Suggested implementation

Propose how to apply it in the current codebase without over-engineering.

## Operational summary

This skill should help produce clearer, more defensible, and more practical architecture decisions. The focus is not on naming patterns for their own sake, but on improving system design with reusable solutions while respecting the real problem, the project context, and the cost of each abstraction.