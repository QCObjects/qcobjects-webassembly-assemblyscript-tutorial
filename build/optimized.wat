(module
 (type $none_=>_none (func))
 (import "index" "helloWorld" (func $assembly/index/helloWorld))
 (memory $0 0)
 (export "sayHello" (func $assembly/index/sayHello))
 (export "memory" (memory $0))
 (func $assembly/index/sayHello
  call $assembly/index/helloWorld
 )
)
