import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Bundle } from './bundle.entity';
import { ProductVariant } from './product-variant.entity';

@Entity({ schema: 'core', name: 'bundle_items' })
@Unique(['bundleId', 'variantId'])
export class BundleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bundle_id', type: 'uuid' })
  bundleId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => Bundle, (bundle) => bundle.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bundle_id' })
  bundle: Bundle;

  @ManyToOne(() => ProductVariant, (variant) => variant.bundleItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
