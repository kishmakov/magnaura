# On Methods Naming

## Application to JavaScript

While each Kitchen object is represented as a specific JavaScript (JS) object, Kitchen script is
intentionally made to be simple and free of underlying JS structure. As a result
of compilation, all methods, described in a Kitchen script definition of some object, should
gain some structure, which would allow us serialize compiled script into the specific JS
object and deserialize it back.

When compiled to JSON representation, each method consists of its signature, which includes its name,
access specifier and body. In the process of assembly body would go directly to function code via
`Function.apply` mechanism. So all the occurrences of all public and private methods into strings
which represents the body, should be accompanied with `this.` prefix. This also applies to
undefined methods, which are supposed to be brought in via further fusion processes.

## Scoping

Name collision should also be of concern. In order to avoid name collision we implement some
scope system via hash suffixes structure. See [scope diagram](scope_rules.png) to grab some
intuition. For each Kitchen object we compute a hash during compilation, which we store
inside it then.

### Private Methods

We change all the private methods names in the moment of compilation, so both their
names and occurrences in function bodies goes in scoped form. For instance, if there
was a private method `sort`, which was used as auxiliary function, then it would
turn into something like `sort_19cb178857258b9` after compilation.

### Public Methods

In contrast to private methods, public methods are not supplied with hash suffix at
the moment of compilation. Kitchen object is supposed to have all the declared
public methods available directly after compilation.

Fusion is the specific situation. In the process of fusion we embed one object into
another. Embedded object loose all its publicity after embedding. So once method turn
from public to private, its name acquires hash suffix. This also applies to all its
occurrences both in the methods of embedded object and in the methods of enveloped object.