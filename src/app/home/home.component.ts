import { Component, DoCheck, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProductItems } from '../types/productItem';
import { ProductItemComponent } from '../product-item/productItem.component';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../../services/BlogService';
import { map, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductItemComponent, NgIf],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  nameButton = 'Click!';

  clickMessage = '';

  bindingMessage = '';

  isActive = true;

  isVisible = true;

  getBlogApi: Subscription;

  products: ProductItems[] = [
    {
      id: 1,
      name: 'gundam1',
      price: 400000,
      image: 'assets/images/gundam1.png',
    },
    {
      id: 2,
      name: 'gundam2',
      price: 300000,
      image: 'assets/images/gundam2.png',
    },
    {
      id: 3,
      name: 'gundam3',
      price: 200000,
      image: 'assets/images/gundam3.png',
    },
    {
      id: 4,
      name: 'gundam4',
      price: 500000,
      image: 'assets/images/gundam4.png',
    },
  ];

  constructor(private blogService: BlogService) {
    console.log('Initalize Conponent');
    this.getBlogApi = new Subscription();
  }

  ngOnInit(): void {
    console.log('Initalize Conponent');
    this.getBlogApi = this.blogService
      .getBlog()
      .pipe(
        map(({ data }) =>
          data.map((item: any) => {
            return {
              ...item,
              name: item.title,
              price: Number(item.body),
              image: 'assets/images/gundam4.png',
            };
          }).filter(product => product.price > 100000)
        ),

      )
      .subscribe((res) => {
        this.products = res;
      });
  }

  ngOnDestroy(): void {
    if (this.getBlogApi) {
      this.getBlogApi.unsubscribe();
      console.log('getBlogApi unsubscribed');
    }
  }

  // ngDoCheck(): void {
  //   console.log('check Conponent')
  // }

  handleClick(): void {
    this.clickMessage = 'Hello word!';
  }

  handleDelete = (id: number) => {
    this.blogService.deleteBlog(id).subscribe(({ data }: any) => {
      if(data == 1){
        this.products = this.products.filter((item) => item.id !== id);
      }
    })
  };

  handleChangeVisible = () => {
    this.isVisible = false;
  };

  updateField(): void {
    console.log('Hello word!');
  }
}
