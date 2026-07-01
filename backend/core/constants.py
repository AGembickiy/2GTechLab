# Common constants for 2GTechLab

# Status constants
STATUS_PENDING = 'pending'
STATUS_IN_PROGRESS = 'in_progress'
STATUS_COMPLETED = 'completed'
STATUS_CANCELLED = 'cancelled'
STATUS_REJECTED = 'rejected'

ORDER_STATUSES = (
    (STATUS_PENDING, 'Ожидает'),
    (STATUS_IN_PROGRESS, 'В работе'),
    (STATUS_COMPLETED, 'Завершен'),
    (STATUS_CANCELLED, 'Отменен'),
    (STATUS_REJECTED, 'Отклонен'),
)

# Payment constants
PAYMENT_METHOD_ONLINE = 'online'
PAYMENT_METHOD_CASH = 'cash'
PAYMENT_METHOD_CARD = 'card'

PAYMENT_METHODS = (
    (PAYMENT_METHOD_ONLINE, 'Онлайн'),
    (PAYMENT_METHOD_CASH, 'Наличные'),
    (PAYMENT_METHOD_CARD, 'Карта'),
)

# Material types
MATERIAL_PLA = 'pla'
MATERIAL_ABS = 'abs'
MATERIAL_RESIN = 'resin'
MATERIAL_TPU = 'tpu'
MATERIAL nylon = 'nylon'
MATERIAL_METAL = 'metal'

MATERIALS = (
    (MATERIAL_PLA, 'PLA'),
    (MATERIAL_ABS, 'ABS'),
    (MATERIAL_RESIN, 'Resin'),
    (MATERIAL_TPU, 'TPU'),
    (MATERIAL_NYLON, 'Nylon'),
    (MATERIAL_METAL, 'Metal'),
)
