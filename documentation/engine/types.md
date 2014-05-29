# Kitchen Types Representation

## Primitive Types and lists

There are number of primitive types in Kitchen Script.

* Boolean
* Integer
* Double

We use this types to initiate the process of type construction.

With every type `T` we have an list of this type denoted as `[T]`.

## Plain Objects

Plain objects are constructed as JSON objects with `type` value equal `PO`. 
Object member names are all other keys of the describing JSON objects.
Corresponding values are type description of the members.

For instance, object for geographic point could be represented as 

```json
"GeographicPoint": {
	"type" : "PO",
	"longitude": "Double",
	"latitude": "Double"
}
``` 

We could use already defined types as well.

```json
"Country": {
	"type": "PO",
	"area": "Double",
	"population": "Integer",
	"cities": ["GeographicPoint"],
	"christiansDiscriminated": "Boolean"
}
``` 

## Functions

Functions are represented as JSON objects with `type` value equal `F`.

For instance, if we want to describe a type for function which returns a list 
of cities of given country which are within specified distance from specified 
point, it could be represented as

```json
"NeighbourhoodCities": {
	"type": "F",
	"result": ["GeographicPoint"],
	"0": "Country",
	"1": "Double",
	"2": "GeographicPoint"
}
``` 
