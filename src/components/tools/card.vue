<template>
  <div class="card-tool">
    <p class="label">Gerar cartao de teste</p>
    <div class="actions">
      <button class="button" @click="generateCard('visa')">Visa</button>
      <button class="button" @click="generateCard('mastercard')">
        Mastercard
      </button>
    </div>

    <div v-if="card.number" class="result">
      <p><strong>Bandeira:</strong> {{ card.brand }}</p>
      <p>
        <strong>Numero:</strong>
        <copy-area :text="card.number" />
      </p>
      <p>
        <strong>Validade:</strong>
        <copy-area :text="card.expiration" />
      </p>
      <p>
        <strong>CVV:</strong>
        <copy-area :text="card.cvv" />
      </p>
      <small>Use apenas em ambientes de teste e homologacao.</small>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CopyArea from '../copy-area.vue';
import useCopy from '../../composables/useCopy';

const card = ref({
  brand: '',
  number: '',
  expiration: '',
  cvv: '',
});

const { copy } = useCopy();

const CARD_PREFIXES = {
  visa: ['4'],
  mastercard: ['51', '52', '53', '54', '55'],
};

const randomDigit = () => Math.floor(Math.random() * 10);

const isValidLuhn = (digits) => {
  const sum = digits
    .slice()
    .reverse()
    .reduce((accumulator, digit, index) => {
      if (index % 2 === 1) {
        const doubled = digit * 2;
        return accumulator + (doubled > 9 ? doubled - 9 : doubled);
      }

      return accumulator + digit;
    }, 0);

  return sum % 10 === 0;
};

const calculateCheckDigit = (digits) => {
  for (let digit = 0; digit <= 9; digit += 1) {
    if (isValidLuhn([...digits, digit])) {
      return digit;
    }
  }

  return 0;
};

const generateCardNumber = (brand) => {
  const prefixes = CARD_PREFIXES[brand];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const digits = prefix.split('').map(Number);

  while (digits.length < 15) {
    digits.push(randomDigit());
  }

  digits.push(calculateCheckDigit(digits));
  return digits.join('');
};

const generateExpiration = () => {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = String(new Date().getFullYear() + 2).slice(-2);
  return `${month}/${year}`;
};

const generateCvv = () =>
  String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');

const generateCard = async (brand) => {
  card.value = {
    brand: brand === 'visa' ? 'Visa' : 'Mastercard',
    number: generateCardNumber(brand),
    expiration: generateExpiration(),
    cvv: generateCvv(),
  };

  await copy(card.value.number);
};
</script>

<style lang="scss" scoped>
.card-tool {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.button {
  background: $bg-color-2;
  border: none;
  padding: 8px;
  color: $text-color;
  cursor: pointer;
  border-radius: 4px;
  transition: ease-in-out 0.3s;

  &:hover {
    background: var(--surface-4);
  }
}

.result {
  background: var(--surface-3);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 10px;

  p {
    margin-bottom: 6px;
    font-size: 13px;
  }

  small {
    display: block;
    margin-top: 8px;
    color: $text-color;
  }
}
</style>
