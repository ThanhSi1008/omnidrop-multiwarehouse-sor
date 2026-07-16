import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Fulfillment } from './fulfillment.entity';

@Entity({ schema: 'order', name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_code', type: 'varchar', length: 100, unique: true })
  orderCode: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100 })
  userId: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_PAYMENT' })
  status: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ name: 'detail_address', type: 'text' })
  detailAddress: string;

  @Column({ name: 'campaign_id', type: 'varchar', length: 100, nullable: true })
  campaignId: string;

  @Column({ name: 'reservation_token', type: 'varchar', length: 100, nullable: true })
  reservationToken: string;

  // Use timestamptz to enforce timezone-aware UTC dates and avoid offset bugs
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => Fulfillment, (fulfillment) => fulfillment.order)
  fulfillments: Fulfillment[];
}
