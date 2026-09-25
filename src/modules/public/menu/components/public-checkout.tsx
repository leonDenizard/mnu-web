'use client'

import { CheckCircle2, ChevronRight, LoaderCircle, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'

import {
  createPublicOrder,
  deletePublicCustomerAddress,
  getPublicCustomerProfile,
  lookupPublicCustomerByPhone,
} from '../api/public-orders.api'
import {
  publicCheckoutFormSchema,
  type PublicCheckoutFormData,
} from '../schemas/public-checkout.schema'
import type { CartItem } from './shopping-cart'

type PublicCheckoutProps = {
  isStoreOpen: boolean
  slug: string
  items: CartItem[]
  supportsDelivery: boolean
  supportsPickup: boolean
  supportsDineIn: boolean
  onClose: () => void
  onOrderCreated: () => void
  onSuccess: () => void
}

type CustomerCache = {
  phone: string
  shortId: string
}

type SavedAddress = Awaited<ReturnType<typeof getPublicCustomerProfile>>['addresses'][number]

export function PublicCheckout({
  isStoreOpen,
  slug,
  items,
  supportsDelivery,
  supportsPickup,
  supportsDineIn,
  onClose,
  onOrderCreated,
  onSuccess,
}: PublicCheckoutProps) {
  const initialService = supportsDelivery ? 'DELIVERY' : supportsPickup ? 'PICKUP' : 'DINE_IN'
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false)
  const [step, setStep] = useState<'loading' | 'phone' | 'details'>('loading')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(true)
  const [customerShortId, setCustomerShortId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const form = useForm<PublicCheckoutFormData>({
    resolver: zodResolver(publicCheckoutFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      serviceType: initialService,
      paymentMethod: 'PIX',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      complement: '',
    },
  })
  const serviceType = useWatch({ control: form.control, name: 'serviceType' })
  const paymentMethod = useWatch({ control: form.control, name: 'paymentMethod' })
  const phone = useWatch({ control: form.control, name: 'phone' })
  const services = [
    { value: 'DELIVERY' as const, label: 'Entrega', enabled: supportsDelivery },
    { value: 'PICKUP' as const, label: 'Retirada', enabled: supportsPickup },
    { value: 'DINE_IN' as const, label: 'No local', enabled: supportsDineIn },
  ].filter((service) => service.enabled)
  const customerStorageKey = `mnu:public-customer:${slug}`

  useEffect(() => {
    const cachedCustomer = readCustomerCache(customerStorageKey)
    if (!cachedCustomer) {
      const timeoutId = window.setTimeout(() => setStep('phone'), 0)
      return () => window.clearTimeout(timeoutId)
    }

    getPublicCustomerProfile(slug, cachedCustomer.shortId)
      .then((customer) => {
        const selectedAddress =
          customer.addresses.find((address) => address.isDefault) ?? customer.addresses[0]
        setSavedAddresses(customer.addresses)
        setSelectedAddressId(selectedAddress?.id ?? null)
        setIsAddressFormVisible(!selectedAddress)
        setCustomerShortId(cachedCustomer.shortId)
        form.reset(fillCustomerProfile(customer, cachedCustomer.phone, initialService))
        setStep('details')
      })
      .catch(() => {
        window.localStorage.removeItem(customerStorageKey)
        setStep('phone')
      })
  }, [customerStorageKey, form, initialService, slug])

  async function findCustomer() {
    const customerPhone = normalizePhone(form.getValues('phone'))
    form.setValue('phone', customerPhone, { shouldValidate: true })
    if (!/^\d{10,11}$/.test(customerPhone)) {
      form.setError('phone', { message: 'Informe um telefone válido com DDD.' })
      return
    }

    setIsLookingUpCustomer(true)
    form.clearErrors('root')
    try {
      const customer = await lookupPublicCustomerByPhone(slug, customerPhone)
      form.setValue('phone', customerPhone)
      if (customer.customerName) form.setValue('name', customer.customerName)
      setStep('details')
    } catch (cause) {
      form.setError('root', {
        message:
          cause instanceof Error ? cause.message : 'Não foi possível consultar este telefone.',
      })
    } finally {
      setIsLookingUpCustomer(false)
    }
  }

  function selectSavedAddress(addressId: string) {
    const address = savedAddresses.find((item) => item.id === addressId)
    if (!address) return

    setSelectedAddressId(addressId)
    setIsAddressFormVisible(false)
    form.setValue('street', address.street)
    form.setValue('number', address.number?.toString() ?? '')
    form.setValue('neighborhood', address.neighborhood)
    form.setValue('city', address.city)
    form.setValue('state', address.state)
    form.setValue('zipCode', address.zipCode)
    form.setValue('complement', address.complement ?? '')
  }

  async function removeSavedAddress(addressId: string) {
    if (!customerShortId || !window.confirm('Remover este endereço salvo?')) return

    try {
      await deletePublicCustomerAddress(slug, customerShortId, addressId)
      const remainingAddresses = savedAddresses.filter((address) => address.id !== addressId)
      setSavedAddresses(remainingAddresses)

      if (selectedAddressId === addressId) {
        const nextAddress = remainingAddresses[0]
        setSelectedAddressId(nextAddress?.id ?? null)
        setIsAddressFormVisible(!nextAddress)
        if (nextAddress) selectSavedAddress(nextAddress.id)
      }
    } catch (cause) {
      form.setError('root', {
        message: cause instanceof Error ? cause.message : 'Não foi possível remover este endereço.',
      })
    }
  }

  const submit = form.handleSubmit(
    async (data) => {
      if (!isStoreOpen) {
        form.setError('root', { message: 'A loja está fechada no momento.' })
        return
      }

      form.clearErrors('root')
      try {
        const result = await createPublicOrder(slug, {
          customerName: data.name.trim(),
          customerPhone: data.phone,
          serviceType: data.serviceType,
          paymentMethod: data.paymentMethod,
          ...(data.serviceType === 'DELIVERY'
            ? {
                deliveryStreet: data.street,
                deliveryAddressNumber: Number(data.number),
                deliveryNeighborhood: data.neighborhood,
                deliveryCity: data.city,
                deliveryState: data.state,
                deliveryZipCode: data.zipCode,
                deliveryComplement: data.complement || undefined,
              }
            : {}),
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            orderModifierGroups: Object.values(
              item.selections.reduce<
                Record<
                  string,
                  {
                    modifierGroupId: string
                    options: Array<{ modifierOptionId: string; quantity: number }>
                  }
                >
              >(
                (groups, selection) => ({
                  ...groups,
                  [selection.groupId]: {
                    modifierGroupId: selection.groupId,
                    options: [
                      ...(groups[selection.groupId]?.options ?? []),
                      { modifierOptionId: selection.option.id, quantity: selection.quantity },
                    ],
                  },
                }),
                {},
              ),
            ),
          })),
        })
        window.localStorage.setItem(
          customerStorageKey,
          JSON.stringify({ phone: data.phone, shortId: result.customerShortId }),
        )
        setOrderNumber(result.orderNumber)
        onOrderCreated()
      } catch (cause) {
        form.setError('root', {
          message: cause instanceof Error ? cause.message : 'Não foi possível enviar o pedido.',
        })
      }
    },
    () => {
      form.setError('root', { message: 'Revise os campos obrigatórios.' })
    },
  )

  if (orderNumber)
    return (
      <Drawer
        open
        modal={false}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DrawerContent
          className="h-[min(32rem,80svh)]"
          overlayClassName="bg-transparent backdrop-blur-[1px]"
          onOverlayClick={onClose}
        >
          <div className="mx-auto flex flex-1 flex-col items-center justify-center px-5 text-center sm:px-6">
            <CheckCircle2 className="size-12 text-emerald-600" />
            <DrawerTitle className="mt-4 text-xl">Pedido enviado!</DrawerTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu pedido #{orderNumber} já entrou na fila da loja.
            </p>
          </div>
          <DrawerFooter>
            <Button
              className="mx-auto flex justify-center items-center w-full h-full p-4"
              onClick={onSuccess}
            >
              Voltar ao cardápio
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )

  return (
    <Drawer
      open
      modal={false}
      repositionInputs={false}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DrawerContent
        aria-labelledby="checkout-title"
        className="max-h-[80dvh]"
        overlayClassName="bg-transparent backdrop-blur-[1px]"
        onOverlayClick={onClose}
      >
        <section className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto]">
          <DrawerHeader className="mx-auto w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle
                  className="text-xl"
                  id="checkout-title"
                >
                  {step === 'phone' ? 'Seu telefone' : 'Finalizar pedido'}
                </DrawerTitle>
                <DrawerDescription className="mt-1">
                  {step === 'phone'
                    ? 'Vamos usar seu número para encontrar seu cadastro.'
                    : 'Preencha os dados para enviar à loja.'}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto grid w-full max-w-2xl gap-4 px-5 py-6 sm:px-6">
              {step === 'loading' && (
                <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                  <LoaderCircle className="mr-2 size-4 animate-spin" /> Carregando seus dados…
                </div>
              )}
              {step === 'phone' && (
                <label className="grid gap-2 text-sm font-medium">
                  Telefone
                  <Input
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={16}
                    placeholder="(00) 00000-0000"
                    value={formatPhone(phone)}
                    onChange={(event) => form.setValue('phone', normalizePhone(event.target.value))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void findCustomer()
                    }}
                  />
                  <span className="text-xs font-normal text-muted-foreground">
                    Seus dados são usados apenas para identificar pedidos anteriores nesta loja.
                  </span>
                  {form.formState.errors.phone && (
                    <span className="text-xs font-normal text-destructive">
                      {form.formState.errors.phone.message}
                    </span>
                  )}
                </label>
              )}
              {step === 'details' && (
                <>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Seu nome
                    <Input {...form.register('name')} />
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Telefone verificado:{' '}
                    <span className="font-medium text-foreground">{formatPhone(phone)}</span>
                  </p>
                  <div>
                    <p className="text-sm font-medium">Como deseja receber?</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {services.map((service) => (
                        <Button
                          key={service.value}
                          variant={serviceType === service.value ? 'default' : 'outline'}
                          onClick={() =>
                            form.setValue('serviceType', service.value, { shouldValidate: true })
                          }
                        >
                          {service.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Forma de pagamento</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(
                        [
                          ['PIX', 'Pix'],
                          ['CARD', 'Cartão'],
                          ['CASH', 'Dinheiro'],
                        ] as const
                      ).map(([value, label]) => (
                        <Button
                          key={value}
                          variant={paymentMethod === value ? 'default' : 'outline'}
                          onClick={() => form.setValue('paymentMethod', value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {serviceType === 'DELIVERY' &&
                    savedAddresses.length > 0 &&
                    !isAddressFormVisible && (
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <fieldset className="grid gap-2">
                          <legend className="text-sm font-medium">Endereço de entrega</legend>
                          {savedAddresses.map((address) => {
                            const isSelected = selectedAddressId === address.id
                            return (
                              <div
                                className={`relative rounded-lg border p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
                                key={address.id}
                              >
                                <label className="flex cursor-pointer items-start gap-3 pr-8">
                                  <input
                                    checked={isSelected}
                                    className="mt-0.5 size-4 accent-primary"
                                    name="delivery-address"
                                    type="radio"
                                    value={address.id}
                                    onChange={() => selectSavedAddress(address.id)}
                                  />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium">
                                      {address.label ?? 'Endereço salvo'}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                      {formatAddress(address)}
                                    </span>
                                  </span>
                                </label>
                                <Button
                                  className="absolute right-2 top-2 text-destructive hover:text-destructive"
                                  size="icon-xs"
                                  type="button"
                                  variant="ghost"
                                  onClick={() => void removeSavedAddress(address.id)}
                                  aria-label={`Remover ${address.label ?? 'endereço salvo'}`}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            )
                          })}
                        </fieldset>
                        <Button
                          className="mt-3 px-0"
                          size="sm"
                          type="button"
                          variant="link"
                          onClick={() => setIsAddressFormVisible(true)}
                        >
                          Usar outro endereço
                        </Button>
                      </div>
                    )}
                  {serviceType === 'DELIVERY' &&
                    (savedAddresses.length === 0 || isAddressFormVisible) && (
                      <div className="grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm sm:col-span-2">
                          Rua
                          <Input {...form.register('street')} />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Número
                          <Input
                            type="number"
                            {...form.register('number')}
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Bairro
                          <Input {...form.register('neighborhood')} />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Cidade
                          <Input {...form.register('city')} />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Estado
                          <Input {...form.register('state')} />
                        </label>
                        <label className="grid gap-1 text-sm">
                          CEP
                          <Input {...form.register('zipCode')} />
                        </label>
                        <label className="grid gap-1 text-sm sm:col-span-2">
                          Complemento (opcional)
                          <Input {...form.register('complement')} />
                        </label>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
          <DrawerFooter>
            {form.formState.errors.root && (
              <p className="mx-auto mb-3 w-full max-w-2xl rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button
              className="mx-auto flex justify-center items-center w-full h-full p-4"
              disabled={
                form.formState.isSubmitting ||
                isLookingUpCustomer ||
                !isStoreOpen ||
                step === 'loading'
              }
              onClick={step === 'phone' ? () => void findCustomer() : submit}
            >
              {(form.formState.isSubmitting || isLookingUpCustomer) && (
                <LoaderCircle className="animate-spin" />
              )}
              {step === 'phone' ? 'Continuar' : 'Enviar pedido'}
            </Button>
          </DrawerFooter>
        </section>
      </DrawerContent>
    </Drawer>
  )
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '').slice(0, 11)
}

function formatPhone(phone: string) {
  const digits = normalizePhone(phone)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function readCustomerCache(storageKey: string): CustomerCache | null {
  try {
    const storedCustomer: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null')
    if (typeof storedCustomer !== 'object' || storedCustomer === null) return null

    const { phone, shortId } = storedCustomer as Record<string, unknown>
    if (typeof phone !== 'string' || typeof shortId !== 'string') return null

    return { phone, shortId }
  } catch {
    return null
  }
}

function fillCustomerProfile(
  customer: Awaited<ReturnType<typeof getPublicCustomerProfile>>,
  phone: string,
  serviceType: PublicCheckoutFormData['serviceType'],
): PublicCheckoutFormData {
  const address = customer.addresses.find((item) => item.isDefault) ?? customer.addresses[0]
  if (!address)
    return {
      name: customer.customerName ?? '',
      phone,
      serviceType,
      paymentMethod: 'PIX',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      complement: '',
    }

  return {
    name: customer.customerName ?? '',
    phone,
    serviceType,
    paymentMethod: 'PIX',
    street: address.street,
    number: address.number?.toString() ?? '',
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    complement: address.complement ?? '',
  }
}

function formatAddress(address: SavedAddress) {
  return [
    address.label,
    `${address.street}, ${address.number ?? 's/n'}`,
    address.neighborhood,
    `${address.city}/${address.state}`,
  ]
    .filter(Boolean)
    .join(' · ')
}
