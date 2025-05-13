import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizer_id' })
  organizerId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'banner_image_url', nullable: true })
  bannerImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ nullable: true })
  capacity: number;

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.organizedEvents)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @OneToMany(() => Order, (order) => order.event)
  orders: Order[];
}
