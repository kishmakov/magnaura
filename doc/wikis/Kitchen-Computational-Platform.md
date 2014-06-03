## What is Kitchen?

Kitchen is a computational platform designed for convenient modularization of computational algorithms. 
Computational algorithm entity is a main object of interest within system.

Kitchen platform is designed with the number of fundamental aspects being addressed.
These are:
 * transparency of module interfaces for reusability
 * integrated test-oriented assembly mechanism
 * organic target functions support

## Kitchen Structure

Kitchen consists of 
 * KitchenScript language
 * documentation system
 * assembly control system

KitchenScript is statically-typed programming language which could be compiled into a number of platforms, including JavaScript. When compiled to JavaScript, KitchenScript modules turned into a building blocks for computational algorithm assembly. 

During the assembly process components are compulsory verified for type correspondence and optionally pre-tested before joining together. Pre-testing is aimed to diminish probability of erroneous misusage of the component functionality. 

Once assembly process is finished, resulted modularized algorithm would possess embedded documentation.
This documentation structure is a reflection of modular structure of the algorithm.

## Detailed Topics

1. [Symbols and Modularization](Symbols-and-Modularization)
2. [Type System](Kitchen-Types-Representation)
3. [Inheritance Explained](Kitchen-Inheritance)