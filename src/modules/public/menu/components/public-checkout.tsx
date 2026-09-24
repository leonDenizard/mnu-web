'use client'

import { CheckCircle2, ChevronRight, LoaderCircle, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  createPublicOrder,
  deletePublicCustomerAddress,
  getPublicCustomerProfile,
  lookupPublicCustomerByPhone,
} from '../api/public-orders.api'
import type { CartItem } from './shopping-cart'

type PublicCheckoutProps = {
  isStoreOpen: boolean
  slug: string
  items: CartItem[]
  supportsDelivery: boolean
  supportsPickup: boolean
  supportsDineIn: boolean
  onClose: () => void
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
  onSuccess,
}: PublicCheckoutProps) {
  const initialService = supportsDelivery ? 'DELIVERY' : supportsPickup ? 'PICKUP' : 'DINE_IN'
  const [serviceType, setServiceType] = useState<'DELIVERY' | 'PICKUP' | 'DINE_IN'>(initialService)
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CASH' | 'CARD'>('PIX')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false)
  const [step, setStep] = useState<'loading' | 'phone' | 'details'>('loading')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(true)
  const [customerShortId, setCustomerShortId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    complement: '',
  })
  const services = [
    { value: 'DELIVERY' as const, label: 'Entrega', enabled: supportsDelivery },
    { value: 'PICKUP' as const, label: 'Retirada', enabled: supportsPickup },
    { value: 'DINE_IN' as const, label: 'No local', enabled: supportsDineIn },
  ].filter((service) => service.enabled)
  const customerStorageKey = `mnu:public-customer:${slug}`

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

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
        setForm((current) => fillCustomerProfile(current, customer, cachedCustomer.phone))
        setStep('details')
      })
      .catch(() => {
        window.localStorage.removeItem(customerStorageKey)
        setStep('phone')
      })
  }, [customerStorageKey, slug])

  async function findCustomer() {
    const phone = normalizePhone(form.phone)
    if (phone.length < 10) {
      setError('Informe um telefone válido com DDD.')
      return
    }

    setIsLookingUpCustomer(true)
    setError(null)
    try {
      const customer = await lookupPublicCustomerByPhone(slug, phone)
      setForm((current) => ({ ...current, phone, name: customer.customerName ?? current.name }))
      setStep('details')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível consultar este telefone.')
    } finally {
      setIsLookingUpCustomer(false)
    }
  }

  function selectSavedAddress(addressId: string) {
    const address = savedAddresses.find((item) => item.id === addressId)
    if (!address) return

    setSelectedAddressId(addressId)
    setIsAddressFormVisible(false)
    setForm((current) => fillAddress(current, address))
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
        if (nextAddress) setForm((current) => fillAddress(current, nextAddress))
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível remover este endereço.')
    }
  }

  async function submit() {
    if (!isStoreOpen) return setError('A loja está fechada no momento.')
    if (!form.name.trim() || !form.phone.trim()) return setError('Informe seu nome e telefone.')
    if (
      serviceType === 'DELIVERY' &&
      (!form.street ||
        !form.number ||
        !form.neighborhood ||
        !form.city ||
        !form.state ||
        !form.zipCode)
    )
      return setError('Informe todos os dados de entrega.')
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await createPublicOrder(slug, {
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        serviceType,
        paymentMethod,
        ...(serviceType === 'DELIVERY'
          ? {
              deliveryStreet: form.street,
              deliveryAddressNumber: Number(form.number),
              deliveryNeighborhood: form.neighborhood,
              deliveryCity: form.city,
              deliveryState: form.state,
              deliveryZipCode: form.zipCode,
              deliveryComplement: form.complement || undefined,
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
        JSON.stringify({ phone: normalizePhone(form.phone), shortId: result.customerShortId }),
      )
      setOrderNumber(result.orderNumber)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar o pedido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderNumber)
    return (
      <div className="fixed inset-0 z-[60] bg-black/15 backdrop-blur-[1px]">
        <section className="absolute inset-x-0 bottom-0 flex h-[92dvh] flex-col rounded-t-3xl border-t border-border bg-card shadow-[0_-18px_45px_rgb(28_25_23_/_0.14)] animate-in slide-in-from-bottom-5 duration-200">
          <div className="mx-auto flex w-full max-w-2xl justify-center px-5 pt-2 sm:px-6">
            <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="mx-auto flex flex-1 flex-col items-center justify-center px-5 text-center sm:px-6">
            <CheckCircle2 className="size-12 text-emerald-600" />
            <h2 className="mt-4 text-xl font-semibold">Pedido enviado!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu pedido #{orderNumber} já entrou na fila da loja.
            </p>
          </div>
          <div className="border-t border-border px-5 py-5 sm:px-6">
            <Button
              className="mx-auto block w-full max-w-2xl"
              onClick={onSuccess}
            >
              Voltar ao cardápio
            </Button>
          </div>
        </section>
      </div>
    )

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/15 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <section
        className="absolute inset-x-0 bottom-0 grid max-h-[80dvh] grid-rows-[auto_minmax(0,1fr)_auto] rounded-t-3xl border-t border-border bg-card shadow-[0_-18px_45px_rgb(28_25_23_/_0.14)] animate-in slide-in-from-bottom-5 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-2xl px-5 pt-2 sm:px-6">
          <div className="mx-auto mb-1 flex h-8 w-full items-center justify-center">
            <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-semibold"
                id="checkout-title"
              >
                {step === 'phone' ? 'Seu telefone' : 'Finalizar pedido'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {step === 'phone'
                  ? 'Vamos usar seu número para encontrar seu cadastro.'
                  : 'Preencha os dados para enviar à loja.'}
              </p>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onClose}
              aria-label="Fechar checkout"
            >
              <X />
            </Button>
          </div>
        </div>
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
                  value={formatPhone(form.phone)}
                  onChange={(event) =>
                    setForm({ ...form, phone: normalizePhone(event.target.value) })
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void findCustomer()
                  }}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Seus dados são usados apenas para identificar pedidos anteriores nesta loja.
                </span>
              </label>
            )}
            {step === 'details' && (
              <>
                <label className="grid gap-1.5 text-sm font-medium">
                  Seu nome
                  <Input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  Telefone verificado:{' '}
                  <span className="font-medium text-foreground">{formatPhone(form.phone)}</span>
                </p>
                <div>
                  <p className="text-sm font-medium">Como deseja receber?</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {services.map((service) => (
                      <Button
                        key={service.value}
                        variant={serviceType === service.value ? 'default' : 'outline'}
                        onClick={() => setServiceType(service.value)}
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
                        onClick={() => setPaymentMethod(value)}
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
                        <Input
                          value={form.street}
                          onChange={(event) => setForm({ ...form, street: event.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Número
                        <Input
                          type="number"
                          value={form.number}
                          onChange={(event) => setForm({ ...form, number: event.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Bairro
                        <Input
                          value={form.neighborhood}
                          onChange={(event) =>
                            setForm({ ...form, neighborhood: event.target.value })
                          }
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Cidade
                        <Input
                          value={form.city}
                          onChange={(event) => setForm({ ...form, city: event.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Estado
                        <Input
                          value={form.state}
                          onChange={(event) => setForm({ ...form, state: event.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        CEP
                        <Input
                          value={form.zipCode}
                          onChange={(event) => setForm({ ...form, zipCode: event.target.value })}
                        />
                      </label>
                      <label className="grid gap-1 text-sm sm:col-span-2">
                        Complemento (opcional)
                        <Input
                          value={form.complement}
                          onChange={(event) => setForm({ ...form, complement: event.target.value })}
                        />
                      </label>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
        <div className="border-t border-border bg-card px-5 py-5 sm:px-6">
          {error && (
            <p className="mx-auto mb-3 w-full max-w-2xl rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            className="mx-auto block w-full max-w-2xl"
            disabled={isSubmitting || isLookingUpCustomer || !isStoreOpen || step === 'loading'}
            onClick={step === 'phone' ? () => void findCustomer() : submit}
          >
            {(isSubmitting || isLookingUpCustomer) && <LoaderCircle className="animate-spin" />}
            {step === 'phone' ? 'Continuar' : 'Enviar pedido'}
            {step === 'phone' && !isLookingUpCustomer && <ChevronRight />}
          </Button>
        </div>
      </section>
    </div>
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
  form: {
    name: string
    phone: string
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    complement: string
  },
  customer: Awaited<ReturnType<typeof getPublicCustomerProfile>>,
  phone: string,
) {
  const address = customer.addresses.find((item) => item.isDefault) ?? customer.addresses[0]
  if (!address) return { ...form, name: customer.customerName ?? form.name, phone }

  return {
    ...form,
    name: customer.customerName ?? form.name,
    phone,
    street: address.street,
    number: address.number?.toString() ?? '',
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    complement: address.complement ?? '',
  }
}

function fillAddress(
  form: {
    name: string
    phone: string
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    complement: string
  },
  address: SavedAddress,
) {
  return {
    ...form,
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
