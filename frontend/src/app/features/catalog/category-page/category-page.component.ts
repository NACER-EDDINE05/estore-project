import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category, PageResponse } from '../../../core/models';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule, ProductCardComponent],
  template: `
    <div class="cat-layout container">
      <!-- Breadcrumb -->
      <nav class="crumb">
        <a routerLink="/products" class="crumb-link">
          <span class="material-icons">arrow_back</span>
          Back to Shop
        </a>
      </nav>

      <div class="cat-layout-inner">
        <!-- Sidebar Filters -->
        <aside class="cat-sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">Categories</h3>
            <button class="sidebar-cat" [class.active]="!selectedCategoryId && !selectedSubCategoryId" (click)="filterByCategory(null)">
              <span class="material-icons">grid_view</span>
              All Categories
            </button>
            @for (cat of parentCategories; track cat.id) {
              <button class="sidebar-cat" [class.active]="selectedCategoryId === cat.id && !selectedSubCategoryId"
                      (click)="filterByCategory(cat.id)">
                <span class="material-icons">chevron_right</span>
                {{ cat.name }}
              </button>
              @if (selectedCategoryId === cat.id && subCategories.length > 0) {
                <div class="sidebar-subcats">
                  @for (sub of subCategories; track sub.id) {
                    <button class="sidebar-subcat" [class.active]="selectedSubCategoryId === sub.id"
                            (click)="filterBySubCategory(sub.id)">
                      <span class="material-icons">subdirectory_arrow_right</span>
                      {{ sub.name }}
                    </button>
                  }
                </div>
              }
            }
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">Availability</h3>
            <label class="sidebar-check">
              <input type="checkbox" [ngModel]="inStockOnly" (ngModelChange)="toggleInStock($event)">
              <span class="check-label">In Stock Only</span>
            </label>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">Price Range</h3>
            <div class="price-range">
              <input type="number" class="es-input price-input" [(ngModel)]="minPrice"
                     placeholder="Min" (input)="applyFilters()">
              <span class="price-sep">—</span>
              <input type="number" class="es-input price-input" [(ngModel)]="maxPrice"
                     placeholder="Max" (input)="applyFilters()">
            </div>
          </div>

          <button class="es-btn es-btn-secondary clear-btn" (click)="clearFilters()">
            <span class="material-icons">refresh</span>
            Clear Filters
          </button>
        </aside>

        <!-- Main Content -->
        <main class="cat-main">
          <!-- Search & Header -->
          <div class="cat-toolbar">
            <div class="search-wrap">
              <span class="material-icons search-icon">search</span>
              <input type="text" class="search-input" [(ngModel)]="searchTerm"
                     placeholder="Search products..." (keyup.enter)="applyFilters()">
              @if (searchTerm) {
                <button class="search-clear" (click)="searchTerm=''; applyFilters()">
                  <span class="material-icons">close</span>
                </button>
              }
            </div>
            <span class="result-count">{{ totalElements }} product{{ totalElements !== 1 ? 's' : '' }} found</span>
          </div>

          <!-- Active Filters -->
          @if (selectedCategoryId || selectedSubCategoryId || inStockOnly || minPrice || maxPrice) {
            <div class="active-filters">
              @if (selectedCategoryId) {
                <span class="filter-chip">
                  {{ getCategoryName(selectedCategoryId) }}
                  <button (click)="filterByCategory(null)"><span class="material-icons">close</span></button>
                </span>
              }
              @if (selectedSubCategoryId) {
                <span class="filter-chip">
                  {{ getSubCategoryName(selectedSubCategoryId) }}
                  <button (click)="filterBySubCategory(0)"><span class="material-icons">close</span></button>
                </span>
              }
              @if (inStockOnly) {
                <span class="filter-chip">
                  In Stock
                  <button (click)="inStockOnly = false; applyFilters()"><span class="material-icons">close</span></button>
                </span>
              }
            </div>
          }

          <!-- Product Grid -->
          @if (loading) {
            <div class="loading-spinner">
              <div class="spinner"></div>
              <span>Loading products...</span>
            </div>
          } @else if (products.length === 0) {
            <div class="empty-state">
              <span class="material-icons empty-icon">search_off</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          } @else {
            <div class="cat-grid">
              @for (product of products; track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages > 1) {
              <div class="pagination">
                <button class="page-btn" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
                  <span class="material-icons">chevron_left</span>
                </button>
                @for (p of pageNumbers; track p) {
                  <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">
                    {{ p + 1 }}
                  </button>
                }
                <button class="page-btn" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">
                  <span class="material-icons">chevron_right</span>
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .cat-layout { padding: 24px 0 80px; }
    .crumb { margin-bottom: 24px; }
    .crumb-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); font-size: 14px; font-weight: 500;
      text-decoration: none; transition: color 0.2s;
    }
    .crumb-link:hover { color: var(--accent-primary); }
    .crumb-link .material-icons { font-size: 18px; }

    .cat-layout-inner {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 32px;
      align-items: start;
    }

    /* Sidebar */
    .cat-sidebar {
      position: sticky;
      top: 96px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
    }
    .sidebar-section { display: flex; flex-direction: column; gap: 6px; }
    .sidebar-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-tertiary);
      margin: 0 0 6px;
    }
    .sidebar-cat {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border: none; background: transparent;
      color: var(--text-secondary); font-size: 14px; font-weight: 500;
      border-radius: var(--radius-sm); cursor: pointer;
      transition: all 0.15s; text-align: left; width: 100%;
      font-family: 'DM Sans', sans-serif;
    }
    .sidebar-cat:hover { background: var(--accent-primary-glow); color: var(--accent-primary); }
    .sidebar-cat.active { background: var(--accent-primary-glow); color: var(--accent-primary); font-weight: 600; }
    .sidebar-cat .material-icons { font-size: 16px; }

    .sidebar-subcats {
      display: flex; flex-direction: column; gap: 2px;
      margin-left: 16px; margin-top: 2px; margin-bottom: 4px;
    }
    .sidebar-subcat {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border: none; background: transparent;
      color: var(--text-tertiary); font-size: 13px; font-weight: 400;
      border-radius: var(--radius-sm); cursor: pointer;
      transition: all 0.15s; text-align: left; width: 100%;
      font-family: 'DM Sans', sans-serif;
    }
    .sidebar-subcat:hover { background: var(--accent-primary-glow); color: var(--accent-primary); }
    .sidebar-subcat.active { color: var(--accent-primary); font-weight: 600; }
    .sidebar-subcat .material-icons { font-size: 14px; }

    .sidebar-check {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; cursor: pointer; border-radius: var(--radius-sm);
      transition: background 0.15s;
    }
    .sidebar-check:hover { background: var(--bg-secondary); }
    .sidebar-check input { accent-color: var(--accent-primary); width: 16px; height: 16px; }
    .check-label { font-size: 14px; color: var(--text-secondary); font-weight: 500; }

    .price-range { display: flex; align-items: center; gap: 8px; }
    .price-input { width: 100%; padding: 8px 10px; font-size: 13px; }
    .price-sep { color: var(--text-tertiary); font-size: 14px; }

    .clear-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
      font-size: 13px; padding: 10px;
    }
    .clear-btn .material-icons { font-size: 16px; }

    /* Main */
    .cat-main { min-height: 400px; }

    .cat-toolbar {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 24px; flex-wrap: wrap;
    }
    .search-wrap {
      flex: 1; position: relative; display: flex; align-items: center;
      min-width: 200px;
    }
    .search-icon {
      position: absolute; left: 14px; font-size: 20px;
      color: var(--text-tertiary); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 12px 40px 12px 44px;
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-pill); color: var(--text-primary);
      font-size: 14px; font-family: 'DM Sans', sans-serif;
      transition: border-color 0.2s;
    }
    .search-input:focus { outline: none; border-color: var(--accent-primary); }
    .search-input::placeholder { color: var(--text-tertiary); }
    .search-clear {
      position: absolute; right: 10px; border: none; background: none;
      cursor: pointer; color: var(--text-tertiary); padding: 4px;
      display: flex; align-items: center;
    }
    .search-clear .material-icons { font-size: 18px; }
    .result-count { font-size: 13px; color: var(--text-tertiary); white-space: nowrap; }

    /* Active filters */
    .active-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 12px; background: var(--accent-primary-glow);
      border: 1px solid var(--accent-primary); border-radius: var(--radius-pill);
      font-size: 13px; font-weight: 500; color: var(--accent-primary);
    }
    .filter-chip button {
      border: none; background: none; cursor: pointer; padding: 0;
      color: var(--accent-primary); display: flex; align-items: center;
    }
    .filter-chip .material-icons { font-size: 14px; }

    /* Grid */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; margin-top: 40px;
    }
    .page-btn {
      min-width: 36px; height: 36px; display: flex; align-items: center;
      justify-content: center; border: 1px solid var(--border-primary);
      border-radius: var(--radius-sm); background: var(--bg-card);
      color: var(--text-secondary); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
    }
    .page-btn:hover:not(:disabled) { border-color: var(--accent-primary); color: var(--accent-primary); }
    .page-btn.active { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-btn .material-icons { font-size: 18px; }

    /* Empty */
    .empty-state {
      text-align: center; padding: 80px 20px; color: var(--text-secondary);
    }
    .empty-icon { font-size: 56px; color: var(--text-tertiary); margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 600; margin: 0 0 8px; color: var(--text-primary); }
    .empty-state p { font-size: 14px; color: var(--text-tertiary); margin: 0; }

    /* Loading */
    .loading-spinner {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 16px; padding: 80px 0;
      color: var(--text-tertiary); font-size: 14px;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--border-primary); border-top-color: var(--accent-primary);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .cat-layout-inner { grid-template-columns: 1fr; }
      .cat-sidebar { position: static; }
    }
  `]
})
export class CategoryPageComponent implements OnInit {
  categories: Category[] = [];
  parentCategories: Category[] = [];
  subCategories: Category[] = [];
  products: Product[] = [];
  loading = true;

  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  inStockOnly = false;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;

  private debounceTimer: any;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get pageNumbers(): number[] {
    const nums: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 3);
    for (let i = start; i < end; i++) nums.push(i);
    return nums;
  }

  ngOnInit(): void {
    this.loadCategories();
    const categoryName = this.route.snapshot.paramMap.get('categoryName');
    if (categoryName) {
      this.api.getCategories().subscribe({
        next: (res) => {
          this.categories = res.data;
          this.parentCategories = res.data.filter(c => !c.parentId);
          const cat = this.parentCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          if (cat) {
            this.selectedCategoryId = cat.id;
            this.loadSubCategories(cat.id);
          }
          this.loadProducts();
        },
        error: () => this.loadProducts()
      });
    } else {
      this.loadProducts();
    }
  }

  loadCategories(): void {
    this.api.getParentCategories().subscribe({
      next: (res) => {
        this.parentCategories = res.data;
        this.categories = res.data;
      },
      error: () => {}
    });
  }

  loadSubCategories(parentId: number): void {
    this.api.getSubCategories(parentId).subscribe({
      next: (res) => {
        this.subCategories = res.data;
        this.categories = [...this.parentCategories, ...this.subCategories];
      },
      error: () => { this.subCategories = []; }
    });
  }

  loadProducts(): void {
    this.loading = true;
    const categoryId = this.selectedSubCategoryId ?? this.selectedCategoryId ?? undefined;
    this.api.getProductsPaginated(this.currentPage, this.pageSize, this.searchTerm || undefined, categoryId, this.inStockOnly || undefined)
      .subscribe({
        next: (res) => {
          const page = res.data;
          this.products = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
          this.currentPage = page.page;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
        }
      });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.selectedSubCategoryId = null;
    this.subCategories = [];
    this.currentPage = 0;
    if (categoryId) {
      this.loadSubCategories(categoryId);
    }
    this.loadProducts();
  }

  filterBySubCategory(subCategoryId: number): void {
    if (subCategoryId === 0) {
      this.selectedSubCategoryId = null;
    } else {
      this.selectedSubCategoryId = subCategoryId;
    }
    this.currentPage = 0;
    this.loadProducts();
  }

  toggleInStock(checked: boolean): void {
    this.inStockOnly = checked;
    this.currentPage = 0;
    this.loadProducts();
  }

  applyFilters(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.currentPage = 0;
      this.loadProducts();
    }, 300);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedSubCategoryId = null;
    this.subCategories = [];
    this.inStockOnly = false;
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 0;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || '';
  }

  getSubCategoryName(id: number): string {
    return this.subCategories.find(c => c.id === id)?.name || '';
  }
}
