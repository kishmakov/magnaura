Kitchen is a platform for building computational algorithms. 
Computational algorithms vary in their size. While "small" algorithm 
could be treated as a whole both as an idea and as a computer representation, 
"big" algorithms are different. Standard approach to this problem is a 
modularization of "big" algorithms at the level of idea and in its 
computer representation.

Cornerstone of the Kitchen modularization system is the notion of the **symbol**. 
Philosophically speaking symbol is everything which could be expressed, 
used in expressions and defined. Expressions are aimed to define one symbols
via another symbols by means of algorithmic terms. 

Symbols are consumables of computation in the sense that once computation 
started, symbols are consequently get defined into numeric values. In a metaphoric 
way, you could think about symbols as a pipes through which computational
definiteness flows. When you define symbol, say A, via expression containing other 
symbols, say B and C, you connect the input of A-pipe to the output of B- and C-pipes. 

These symbol dualities are reflected in notations. The ability to act as an input, 
i.e. to be expressed and subsequently transfer the definiteness further is 
depicted with gold trapezoid tapering to the top. The ability to act as an output,
i.e. to be part of other symbols expressions and to inject definiteness into 
them is depicted with purple trapezoid widening to the top. See figure below.

![Symbol: Input -- Output -- Complete](https://raw.githubusercontent.com/kishmakov/Kitchen/master/doc/images/symbols_together.png)

Acquaintance with modularization through symbols is better to start with a toy example. 
Let us take this example to be quadratic equation solution algorithm. Let us formulate the problem as follows. 

> Given coefficients `a`, `b` and `c`. Provided that equation `a*x*x + b*x + c` has different roots, 
> one need to find these roots denoted as `x1` and `x2`. 

By algorithmic solution we mean such an algorithm that express `x1` and `x2` by  
means of coefficient symbols `a`, `b` and `c`. Provided such an algorithm, 
once we define those coefficients symbols we could subsequently eliminate all 
undefined symbols up until `x1` and `x2`. An example of such an expression is presented below.

![Simple Quadratic Equation](https://raw.githubusercontent.com/kishmakov/Kitchen/master/doc/images/quadratic_equation_simple.png)

This diagram depicts two algorithmic modules (each corresponds to a green bar). 
They have same shared input symbols `a`, `b` and `c`. These symbols are waiting for 
either expression or definition in order to stop being inputs.
Symbols `x1` and `x2` are respective outputs and they are already expressed. They are waiting
for some usage in order to finish their service. 

Such modules are used as building blocks for construction of modularized algorithms. 
During modularized algorithm construction we join outputs of some modules with inputs of 
some other modules. When construction process is ended, uncompleted input (cor. output) symbols 
are the inputs (cor. outputs) of resulting algorithm. Thus the result of joining of 
algorithmic modules is again an algorithmic module.

All the outputs of algorithmic module must be expressed via input symbols. 
All the inputs are should be ready to be either expressed or defined with numeric value. 
These assumptions let us speak about two natures of every module: **mama**-nature 
and **papa**-nature.

Mama-nature manifests in the ability of the module to perform it computational function 
independently of the way its inputs defined: by expressions or by numeric values. 
In other words, module should be open to every scenario. On the contrary, 
papa-nature manifests in the necessity to pass further only expressed symbols. 
This brings some "invariant" into the idea of the module: module decreases uncertainty. 

Let us consider another modularization of quadratic equation solution.

![Modularized Quadratic Equation](https://raw.githubusercontent.com/kishmakov/Kitchen/master/doc/images/quadratic_equation_modularized.png)

This scheme naturally reflects the point of discriminant being a part of the algorithmic 
solution. Discriminant computation is encapsulated into separate submodule. This submodule
injects its definiteness into submodules which compute `x1` and `x2`. Flexibility of 
inputs of these submodules is presented in fact that part of their inputs left intact
(`a` and `b`), while other part of their inputs is expressed with other symbols (`D`). 

Although it is not quite obvious from this example, such encapsulations help us 
to reduce complexity of submodules and manage control over them. This approach 
is intended to allow us to deal with algorithms of higher complexity.

Another modularization is presented below as well.

![Another Modularization of Quadratic Equation](https://raw.githubusercontent.com/kishmakov/Kitchen/master/doc/images/quadratic_equation_last.png)

You could note that there is a submodule in this scheme which defines two output symbols.