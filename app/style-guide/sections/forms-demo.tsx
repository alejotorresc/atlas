'use client';

import { useState } from 'react';
import { SegmentedControl } from '@/components/design-system/SegmentedControl';

export function SegmentedControlDemo() {
  const [value, setValue] = useState('month');
  return (
    <SegmentedControl
      name="periodo"
      value={value}
      onChange={setValue}
      options={[
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mes' },
        { value: 'year', label: 'Ano' },
      ]}
    />
  );
}
