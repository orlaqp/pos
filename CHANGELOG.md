# Version 2

Para la proxima version (v2) del POS vamos a incluir lo siguiente:

## Metodos de Pago

A la hora de marcar la orden como pagada se va a incluir la opcion de marcar los metods de pagos recibidos. Los metodos serian:

- Cash
- Credit Card (no se necesita especificar el tipo de tarjeta de credito)
- Cheque (esta opcion va a estar protegida con un permiso especial. Solo usuarios con ese permiso pueden aceptar cheques a la hora de marcar la orden como pagada)

En el casio que una orden se pague con mas de un metodo de pago, el sistema te va a permitir distribuir la cantidad pagada por metodo de pago. Ejemplo:

Orden total: $100.50

Cash: $40.00
Credit Card: $50.00
Check: $10.50

Asi se reflejaria en el recibo a la hora de imprimirlo.

## Metodo de pago en el recibo

El nuevo formato del recibo va a incluir los metodos de pago(s) que se utilizaron para pagar la orden

## Nuevo permiso para devolver articulos o ordenes enteras

Para controlar un poco mejor quien puede recibir devoluciones de ordenes parciales o completas se va a adicionar un permiso nuevo al sistema donde solo el usuario con ese permiso va a poder hacer los cambios.

## Adicionar codigo de empleado

Para poder implementar la nueva numeracion de ordenes, vamos a necesitar adicionar un nuevo field a la informacion del empleado. Basicamente vamos a necesitar adicionar un codigo (que debe ser unico) por empleado. Esta informacion va a ser interna y no se va a necesitar poner ninguna information personal como nombre o algo asi en la orden pero va a servir para identificar quien la hizo internamente.

## Nueva numeracion de ordenes

En lugar de usar GUIDs como numero de ordenes lo que hace unpoco dificil identificar el origen de la orden lo vamos a hacer un poco diferente. El nuevo formato del numero de orden seria asi:

| Espacios  | Descripcion                       | Ejemplo      |
|-----------|-----------------------------------|--------------|
| 2         |  Numero de estacion               |  01          |
| 1         |  separator                        |  -           |
| 2         |  Numero de empleado               |  03          |
| 1         |  separator                        |  -           |
| 2         |  Año usando solo 2 cifras         |  22          |
| 2         |  Mes usando solo 2 cifras         |  07          |
| 2         |  Dia usando solo 2 cifras         |  04          |
| 1         |  separator                        |  -           |
| 5         |  Consecutivo para el dia          |  0001        |

Este seria un ejempo del numero completo:  **01-03-220704-0001**. Usando este formato podemos identificar el device en el que se hizo la order, el empleado que la procesoó, la fecha y   por ultimo el numero de orden. Con esta informacion le deberia ser mucho mas facil identificar ordenes historicas o hacer cualquier revision auditoria que se necesite.

Este seria el mismo ejemplo pero explicado horizontalmente:

| Estacion  | Sep | Emp | Sep | Año | Mes | Dia | Sep | Numero de Orden del dia |
|-----------|-----|-----|-----|-----|-----|-----|-----|-------------------------|
| 01        |  -  | 03  |  -  |  22 |  07 |  04 |  -  | 00001                   |


## Nuevo codigo de barra para identificar la orden.

El nuevo formato del recibo va a incluir esta nueva informacion. Se va a reemplazar el QA code actual que represent el GUID de la orden por este nuevo formato.



# v1.0.52

## Enhancements

- Reduce the cache size of orders to last 5 days

## Bugfixes

- Fixed issue returning orders by date range (implemented pagination due to the 1Mb limitation from dynamodb)
- Removed deleted order from order reports
- Fixed issue searching by numbers when the search length is less that 3
- Fixed order search with scanner
- Fixed issue entering weight under 1.0 unit measure

# v1.0.53

## Bugfixes

- Search for entire order no when a full number has been provided (probably from scanner)



PENDING


- los iPad votan la aplicación varias veces al día .
- cuando se busca un tíquet pagado no siempre aparecen.
- en ocasiones cuando se va el programa al volver abrir pierde el número de estación y la frecuencia como si se borrara y reinstalara .
-hay ventas que aunque se sierren se quedan en cualquier máquina como si estuvieran abiertas.
