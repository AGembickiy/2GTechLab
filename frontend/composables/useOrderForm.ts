import { computed, type ComputedRef } from 'vue'

interface OrderFormState {
  originalFile: File | null;
  file: File | null;
  productName: string;
  copies: number;
  material: 'pla' | 'petg' | 'abs' | 'tpu' | '';
  color: 'white' | 'black' | 'gray' | 'custom' | '';
  amsSlots: Array<{
    material: 'pla' | 'petg' | 'abs' | 'tpu' | '';
    color: 'white' | 'black' | 'gray' | 'custom' | '';
  }>;
  quality: 'draft' | 'standard' | 'high';
  printType: 'single' | 'multi';
  postProcessing: Array<'sanding' | 'priming' | 'painting'>;
  comment: string;
  name: string;
  phone: string;
  email: string;
  deliveryAddress: string;
}

interface OrderDerived {
  fileName: ComputedRef<string>;
  fileFormatText: ComputedRef<string>;
  sizeText: ComputedRef<string>;
  weightText: ComputedRef<string>;
  materialUsageGrams: ComputedRef<number>;
  printTimeHours: ComputedRef<number>;
  postProcessingText: ComputedRef<string>;
  totalPriceRub: ComputedRef<number>;
  totalPriceText: ComputedRef<string>;
  canSubmit: ComputedRef<boolean>;
}

const POST_PROCESSING_LABELS: Record<OrderFormState['postProcessing'][number], string> = {
  sanding: 'Шлифовка',
  priming: 'Грунтовка',
  painting: 'Покраска',
};

export function useOrderForm(): { form: OrderFormState; derived: OrderDerived } {
  const form = useState<OrderFormState>('order-form', () => ({
    originalFile: null,
    file: null,
    productName: '',
    copies: 1,
    material: '',
    color: '',
    amsSlots: Array.from({ length: 4 }, () => ({
      material: '',
      color: '',
    })),
    quality: 'standard',
    printType: 'single',
    postProcessing: [],
    comment: '',
    name: '',
    phone: '',
    email: '',
    deliveryAddress: '',
  }));

  const fileName = computed(() => form.value.file?.name ?? '');

  const fileFormatText = computed(() => {
    if (!fileName.value) return 'Определится по расширению';

    const parts = fileName.value.split('.');
    return parts.length > 1
      ? parts.at(-1)?.toUpperCase() ?? '—'
      : '—';
  });

  const sizeText = computed(() => 'Будет определено после анализа');

  const weightText = computed(() => 'Будет определено автоматически');

  const materialUsageGrams = computed(() => {
    const base = 50;
    const copiesFactor = Math.max(1, Number(form.value.copies) || 1);

    let qualityFactor = 1;

    if (form.value.quality === 'high') {
      qualityFactor = 1.4;
    } else if (form.value.quality === 'draft') {
      qualityFactor = 0.8;
    }

    const printTypeFactor = form.value.printType === 'multi'
      ? 1.15
      : 1;

    return Math.round(
      base *
      copiesFactor *
      qualityFactor *
      printTypeFactor
    );
  });

  const printTimeHours = computed(() => {
    const baseHours = 2;
    const copiesFactor = Math.max(1, Number(form.value.copies) || 1);

    let qualityFactor = 1;

    if (form.value.quality === 'high') {
      qualityFactor = 1.6;
    } else if (form.value.quality === 'draft') {
      qualityFactor = 0.8;
    }

    return +(
      baseHours *
      copiesFactor *
      qualityFactor
    ).toFixed(1);
  });

  const postProcessingText = computed(() => {
    if (!form.value.postProcessing.length) {
      return 'Не выбрано';
    }

    return form.value.postProcessing
      .map((v) => POST_PROCESSING_LABELS[v] ?? v)
      .join(', ');
  });

  const totalPriceRub = computed(() => {
    if (!form.value.material || !form.value.copies) {
      return 0;
    }

    const baseRatePerGram: Record<
      Exclude<OrderFormState['material'], ''>,
      number
    > = {
      pla: 5,
      petg: 6,
      abs: 7,
      tpu: 8,
    };

    const materialRate =
      baseRatePerGram[form.value.material] ?? 5;

    let price =
      materialUsageGrams.value * materialRate;

    if (form.value.quality === 'high') {
      price *= 1.3;
    } else if (form.value.quality === 'draft') {
      price *= 0.9;
    }

    if (form.value.printType === 'multi') {
      price *= 1.15;
    }

    if (form.value.postProcessing.includes('sanding')) {
      price += 300;
    }

    if (form.value.postProcessing.includes('priming')) {
      price += 400;
    }

    if (form.value.postProcessing.includes('painting')) {
      price += 600;
    }

    return Math.round(price);
  });

  const totalPriceText = computed(() => {
    if (!totalPriceRub.value) {
      return '—';
    }

    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(totalPriceRub.value);
  });

  const canSubmit = computed(() => {
    return Boolean(
      form.value.file &&
      form.value.productName &&
      form.value.copies &&
      form.value.material &&
      form.value.color &&
      form.value.name &&
      form.value.phone &&
      form.value.email,
    );
  });

  return {
    form: form.value,
    derived: {
      fileName,
      fileFormatText,
      sizeText,
      weightText,
      materialUsageGrams,
      printTimeHours,
      postProcessingText,
      totalPriceRub,
      totalPriceText,
      canSubmit,
    },
  };
}